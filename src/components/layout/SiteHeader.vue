<script setup lang="ts">
import { PhArrowUpRight, PhList } from '@phosphor-icons/vue'
import { computed, ref } from 'vue'
import type { SectionId, SectionMeta } from '@/types/site'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import BrandMark from '@/components/ui/BrandMark.vue'
import MobileNav from './MobileNav.vue'

/**
 * 电影感固定页眉
 * 结构对齐参考图：斜切 JDZ 字标 / 居中的五个章节 / 右侧 EXPLORE TOGETHER。
 * 页面滚动在内部 .scroller 中完成，所以这里用 fixed 即可始终压在主视觉上。
 */
const props = defineProps<{
  sections: SectionMeta[]
  activeIndex: number
  email: string
}>()

const emit = defineEmits<{ navigate: [id: string] }>()

const menuOpen = ref(false)

const navItems = [
  { id: 'home' as SectionId, label: 'HOME' },
  { id: 'members' as SectionId, label: 'THE THREE' },
  { id: 'project' as SectionId, label: 'PROJECTS' },
  { id: 'log' as SectionId, label: 'JOURNAL' },
  { id: 'about' as SectionId, label: 'ABOUT' },
]

const activeId = computed(() => props.sections[props.activeIndex]?.id ?? 'home')

function go(id: string) {
  emit('navigate', id)
}

function handleMenuNavigate(id: string) {
  menuOpen.value = false
  emit('navigate', id)
}
</script>

<template>
  <header
    class="cinema-header fixed inset-x-0 top-0 z-50 flex h-20 items-center justify-between px-5 sm:px-8 lg:px-12 xl:px-16"
    :class="{ 'is-home': activeId === 'home' }"
  >
    <button
      type="button"
      class="group flex cursor-pointer items-center gap-3 focus-clip"
      aria-label="回到首页"
      @click="go('home')"
    >
      <BrandMark size="md" />
      <span class="flex flex-col items-start leading-none">
        <span class="text-[19px] font-semibold tracking-[-0.02em] text-white">JDZone</span>
        <span class="mt-1 hidden font-mono text-[8px] uppercase tracking-[0.28em] text-white/42 sm:block">
          Joint Discovery Zone
        </span>
      </span>
    </button>

    <nav class="hidden items-center gap-8 lg:flex xl:gap-11" aria-label="主导航">
      <button
        v-for="item in navItems"
        :key="item.id"
        type="button"
        class="cinema-nav-link"
        :class="{ 'is-active': activeId === item.id }"
        :aria-current="activeId === item.id ? 'page' : undefined"
        @click="go(item.id)"
      >
        {{ item.label }}
      </button>
    </nav>

    <div class="flex items-center gap-3 sm:gap-5">
      <button
        type="button"
        class="group hidden items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/68 transition-colors hover:text-white sm:flex"
        @click="go('contact')"
      >
        EXPLORE TOGETHER
        <PhArrowUpRight
          :size="13"
          class="text-accent transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </button>

      <ThemeToggle />

      <button
        type="button"
        class="grid h-9 w-9 cursor-pointer place-items-center border border-white/20 text-white transition-colors hover:border-accent hover:text-accent focus-clip lg:hidden"
        :aria-expanded="menuOpen"
        aria-controls="mobile-nav"
        aria-label="打开章节菜单"
        @click="menuOpen = true"
      >
        <PhList :size="16" aria-hidden="true" />
      </button>
    </div>

    <MobileNav
      :open="menuOpen"
      :sections="sections"
      :active-index="activeIndex"
      :email="email"
      @close="menuOpen = false"
      @navigate="handleMenuNavigate"
    />
  </header>
</template>
