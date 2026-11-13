<script setup lang="ts">
import { defineAsyncComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import type { AsyncComponentLoader } from 'vue'
import type { SectionId } from '@/types/site'
import SectionSkeleton from '@/components/ui/SectionSkeleton.vue'

/**
 * 章节懒加载容器
 * ------------------------------------------------------------------
 * 1. 距视口约 900px 时才拉取章节代码，首屏只需要 Home 的 JS；
 * 2. 代码下载期间显示同尺寸骨架，避免布局跳动；
 * 3. 包裹层保留 100dvh 高度和 id，深链接与滚动吸附在加载前也成立。
 *
 * 之后接后端时，章节内容依然通过 props 注入，这里只关心代码分包。
 */
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  sectionId: SectionId
  loader: AsyncComponentLoader
  /** 首屏章节可设为 true，跳过一次可见性判断 */
  eager?: boolean
}>()

const root = ref<HTMLElement | null>(null)
const shouldRender = ref(props.eager ?? false)

const AsyncSection = defineAsyncComponent({
  loader: props.loader,
  loadingComponent: SectionSkeleton,
  // 快速网络下不闪骨架；慢网络才出现
  delay: 160,
  timeout: 20000,
})

let observer: IntersectionObserver | null = null
let idleHandle: number | null = null
let idleTimer: number | null = null

/** Safari 旧版本没有 requestIdleCallback，显式做可选能力检测 */
type IdleWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number
  cancelIdleCallback?: (handle: number) => void
}

function load() {
  shouldRender.value = true
  observer?.disconnect()
  observer = null
  if (idleHandle !== null) {
    ;(window as IdleWindow).cancelIdleCallback?.(idleHandle)
    idleHandle = null
  }
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }
}

onMounted(() => {
  if (shouldRender.value) return

  if (!('IntersectionObserver' in window) || !root.value) {
    shouldRender.value = true
    return
  }

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) load()
    },
    { rootMargin: '1200px 0px' },
  )
  observer.observe(root.value)

  /*
   * 首屏之后在空闲时间把其余章节悄悄取回：
   * 用户真正开始滚动时 DOM 已经齐了，吸附不会因为骨架插入而顿一下；
   * 首屏网络仍然只先拿 Home，分包与懒加载的意义保留。
   */
  const idleWindow = window as IdleWindow
  if (typeof idleWindow.requestIdleCallback === 'function') {
    idleHandle = idleWindow.requestIdleCallback(load, { timeout: 2600 })
  } else {
    idleTimer = window.setTimeout(load, 1600)
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  if (idleHandle !== null) {
    ;(window as IdleWindow).cancelIdleCallback?.(idleHandle)
    idleHandle = null
  }
  if (idleTimer !== null) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }
})
</script>

<template>
  <!-- snap-section 同时提供 100dvh 最小高度与滚动吸附点，
       缺少它时其余章节不会被吸附，整页会一直弹回首页。 -->
  <div :id="sectionId" ref="root" class="snap-section">
    <component :is="AsyncSection" v-if="shouldRender" v-bind="$attrs" />
    <div v-else class="flex min-h-[100dvh] items-center">
      <SectionSkeleton class="w-full" />
    </div>
  </div>
</template>
