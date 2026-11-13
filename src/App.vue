<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch, watchEffect } from 'vue'
import type { SectionId, SiteContent } from '@/types/site'
import { useBoot } from '@/composables/useBoot'
import { useSectionNav } from '@/composables/useSectionNav'
import { useTheme } from '@/composables/useTheme'
import BootScreen from '@/components/layout/BootScreen.vue'
import FooterBar from '@/components/layout/FooterBar.vue'
import LazySection from '@/components/layout/LazySection.vue'
import SideNav from '@/components/layout/SideNav.vue'
import SiteHeader from '@/components/layout/SiteHeader.vue'
import ParticleField from '@/components/background/ParticleField.vue'
import HomeSection from '@/components/sections/HomeSection.vue'
import ToastStack from '@/components/ui/ToastStack.vue'

/**
 * 应用外壳
 * ------------------------------------------------------------------
 * 只负责三件事：
 * 1. 章节容器与导航状态（滚动、键盘、hash）
 * 2. 开场加载层的生命周期
 * 3. 把内容从 main.ts 传进来的 SiteContent 分发给各章节
 *
 * 首屏 Home 直接打包，其余章节由 LazySection 在接近视口时再加载。
 */
const props = defineProps<{
  content: SiteContent
}>()

const scroller = ref<HTMLElement | null>(null)
const sectionIds = props.content.sections.map((section) => section.id) as SectionId[]

const { activeIndex, progress, scrollToId, scrollToIndex } = useSectionNav(
  scroller,
  sectionIds,
)

const { phase, progress: bootProgress, isBooting, skip } = useBoot(1000)
const { toggle: toggleTheme } = useTheme()

/**
 * 异步章节。写成对象而不是在模板里内联箭头函数，
 * 避免每次渲染都生成新的 loader 引用。
 */
const loaders = {
  about: () => import('@/components/sections/AboutSection.vue'),
  members: () => import('@/components/members/MembersSection.vue'),
  project: () => import('@/components/sections/ProjectSection.vue'),
  log: () => import('@/components/sections/LogSection.vue'),
  contact: () => import('@/components/sections/ContactSection.vue'),
}

/** 导航时同步 hash，刷新或分享后可以回到同一章。 */
function goSection(id: string) {
  if (!sectionIds.includes(id as SectionId)) return
  const sectionId = id as SectionId
  scrollToId(sectionId)

  const url = new URL(window.location.href)
  url.hash = sectionId
  window.history.replaceState(null, '', url)
}

/**
 * 页面里的 #members、#home 这类锚点不会触发原生滚动：
 * 文档被 overflow: clip 锁住，滚动只发生在 main.scroller 内。
 * 这里统一接管站内锚点，交给 scrollToId。
 */
function onDocumentClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
  if (!anchor) return

  const id = anchor.getAttribute('href')?.slice(1)
  if (!id) return

  // 跳到主要内容：把焦点交给滚动容器，保留键盘用户的操作连续性。
  if (id === 'main-content') {
    event.preventDefault()
    scroller.value?.focus()
    return
  }

  if (!sectionIds.includes(id as SectionId)) return
  event.preventDefault()
  goSection(id)
}

/** 键盘：上下 / PageUp / PageDown 翻章，Ctrl(Cmd)+J 切主题。 */
function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select, [contenteditable="true"]')) return

  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'j') {
    event.preventDefault()
    toggleTheme()
    return
  }

  if (event.metaKey || event.ctrlKey || event.altKey) return

  if (event.key === 'ArrowDown' || event.key === 'PageDown') {
    event.preventDefault()
    scrollToIndex(activeIndex.value + 1)
    return
  }

  if (event.key === 'ArrowUp' || event.key === 'PageUp') {
    event.preventDefault()
    scrollToIndex(activeIndex.value - 1)
    return
  }

  // Home / End 只在焦点位于页面本体时生效，避免抢走表单控件的行为。
  const onBody = !target || target === document.body || target === scroller.value
  if (!onBody) return

  if (event.key === 'Home') {
    event.preventDefault()
    scrollToIndex(0)
  } else if (event.key === 'End') {
    event.preventDefault()
    scrollToIndex(sectionIds.length - 1)
  }
}

/** 锁住背景滚动，加载层关闭后自动解除。 */
watchEffect(() => {
  document.documentElement.classList.toggle('booting', isBooting.value)
})

/** 从 hash 进入时，等开机动画结束、滚动锁解除后再定位。 */
const initial = window.location.hash.slice(1) as SectionId
const hasInitialSection = sectionIds.includes(initial)

watch(
  phase,
  async (value) => {
    if (value !== 'done') return

    // 通知 v-reveal 开始观察，避免首屏入场动画在开机遮罩背后播完
    window.dispatchEvent(new CustomEvent('jdz:boot-done'))
    if (!hasInitialSection) return
    await nextTick()
    scrollToId(initial, 'auto')
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('click', onDocumentClick)

  // 浏览器的原生 hash 定位可能滚动 body，这里复位后只操作内部滚动容器
  document.body.scrollTop = 0
  document.documentElement.scrollTop = 0
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('click', onDocumentClick)
  document.documentElement.classList.remove('booting')
})
</script>

<template>
  <div class="relative">
    <ParticleField />

    <a
      href="#main-content"
      class="fixed left-4 top-3 z-[70] -translate-y-24 bg-ink px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-paper transition-transform duration-200 focus:translate-y-0"
    >
      跳到主要内容
    </a>

    <!-- 四角准星：参考页的固定装饰，窄屏隐藏，避免压住内容 -->
    <div aria-hidden="true" class="pointer-events-none fixed inset-0 z-30 hidden md:block">
      <span class="crosshair left-10 top-[96px]" />
      <span class="crosshair right-10 top-[96px]" />
      <span class="crosshair bottom-16 left-10" />
      <span class="crosshair bottom-16 right-10" />
    </div>

    <div :inert="isBooting" class="relative z-10">
      <SiteHeader
        :sections="content.sections"
        :active-index="activeIndex"
        :email="content.meta.email"
        @navigate="goSection"
      />

      <main
        id="main-content"
        ref="scroller"
        class="scroller"
        tabindex="-1"
        aria-label="JDZone 站点章节"
      >
        <HomeSection id="home" :content="content" />

        <LazySection
          section-id="about"
          :loader="loaders.about"
          :content="content"
        />
        <LazySection
          section-id="members"
          :loader="loaders.members"
          :content="content"
        />
        <LazySection
          section-id="project"
          :loader="loaders.project"
          :content="content"
        />
        <LazySection
          section-id="log"
          :loader="loaders.log"
          :content="content"
        />
        <LazySection
          section-id="contact"
          :loader="loaders.contact"
          :content="content"
        />
      </main>

      <SideNav
        :sections="content.sections"
        :active-index="activeIndex"
        @navigate="goSection"
      />

      <FooterBar :progress="progress" />
    </div>

    <BootScreen
      v-if="phase !== 'done'"
      :progress="bootProgress"
      :phase="phase"
      @skip="skip"
    />

    <ToastStack />
  </div>
</template>
