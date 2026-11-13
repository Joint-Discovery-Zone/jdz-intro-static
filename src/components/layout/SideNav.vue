<script setup lang="ts">
import type { SectionMeta } from '@/types/site'

/**
 * 桌面端右侧章节导航
 * 细线长度 + 颜色标出当前位置；文字标签只在 hover / 当前章节时出现，
 * 保持画面安静，同时每个按钮都有完整的 aria-label 供读屏使用。
 * 与参考页一致：1280px 以下隐藏，改由页眉菜单进入。
 */
defineProps<{
  sections: SectionMeta[]
  activeIndex: number
}>()

const emit = defineEmits<{ navigate: [id: string] }>()
</script>

<template>
  <nav
    class="fixed right-[30px] top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end xl:flex"
    aria-label="章节快速导航"
  >
    <button
      v-for="(section, index) in sections"
      :key="section.id"
      type="button"
      class="group flex cursor-pointer items-center gap-[11px] py-[9px] pl-4 focus-clip"
      :aria-current="index === activeIndex ? 'step' : undefined"
      :aria-label="`第 ${section.index} 章，${section.label}`"
      @click="emit('navigate', section.id)"
    >
      <span
        class="whitespace-nowrap font-mono text-[11px] tracking-[0.14em] transition-all duration-300 ease-brand"
        :class="
          index === activeIndex
            ? 'text-ink opacity-100'
            : 'translate-x-1.5 text-muted opacity-0 group-hover:translate-x-0 group-hover:opacity-75 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
        "
      >
        {{ section.label }}
      </span>
      <span
        class="block h-[1.5px] rounded-full transition-all duration-300 ease-brand"
        :class="
          index === activeIndex
            ? 'w-[30px] bg-accent'
            : 'w-4 bg-current text-muted group-hover:w-6 group-hover:bg-ink'
        "
      />
    </button>
  </nav>
</template>
