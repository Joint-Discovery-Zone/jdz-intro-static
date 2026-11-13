<script setup lang="ts">
import { PhList } from '@phosphor-icons/vue'
import { ref } from 'vue'
import type { SectionMeta } from '@/types/site'
import BrandSeal from '@/components/ui/BrandSeal.vue'
import ThemeToggle from '@/components/ui/ThemeToggle.vue'
import MobileNav from './MobileNav.vue'

/**
 * 固定页眉
 * 结构对齐参考页：品牌 / SYS.ONLINE / CONTACT / 主题开关。
 * 参考页在窄屏直接删掉导航，这里补一个菜单按钮，1280px 以下都能打开章节列表。
 */
defineProps<{
  sections: SectionMeta[]
  activeIndex: number
  email: string
}>()

const emit = defineEmits<{ navigate: [id: string] }>()

const menuOpen = ref(false)

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
    class="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-line bg-paper px-5 py-4 sm:px-10 sm:py-5"
  >
    <button
      type="button"
      class="group flex cursor-pointer items-center gap-[11px] focus-clip"
      aria-label="回到首页"
      @click="go('home')"
    >
      <BrandSeal size="sm" />
      <span class="flex items-baseline gap-2.5">
        <span class="text-[15px] font-bold tracking-[0.02em]">JDZone</span>
        <span class="hidden font-mono text-[10px] tracking-[0.22em] text-muted sm:inline">
          JOINT DISCOVERY ZONE
        </span>
      </span>
    </button>

    <div class="flex items-center gap-4">
      <!-- 系统状态：参考页用朱红点 + 灰字，而不是高饱和青色文字 -->
      <span class="hidden items-center gap-2 font-mono text-[10px] tracking-[0.1em] text-muted min-[721px]:flex">
        <span class="relative h-1.5 w-1.5 rounded-full bg-accent pulse-dot" aria-hidden="true" />
        SYS.ONLINE
      </span>

      <button
        type="button"
        class="top-btn hidden items-center justify-center border border-line px-4 py-1.5 font-mono text-[11px] font-bold tracking-[0.1em] text-ink transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-white focus-clip notch-sm min-[721px]:inline-flex"
        @click="go('contact')"
      >
        CONTACT
      </button>

      <ThemeToggle />

      <button
        type="button"
        class="grid h-8 w-8 cursor-pointer place-items-center border border-line text-ink transition-colors hover:border-accent hover:text-accent focus-clip notch-sm xl:hidden"
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
