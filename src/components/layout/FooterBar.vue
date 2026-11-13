<script setup lang="ts">
import { computed } from 'vue'

/**
 * 固定底栏
 * 保留参考页的系统状态与版权信息；顶部加一条 2px 的阅读进度线，
 * 不占用文字空间，移动端也不会把内容挤出视口。
 */
const props = defineProps<{
  progress: number
}>()

const percent = computed(() => Math.round(Math.min(1, Math.max(0, props.progress)) * 100))
</script>

<template>
  <footer
    class="fixed inset-x-0 bottom-0 z-40 h-12 border-t border-line bg-paper font-mono text-[9px] tracking-[0.08em] text-muted sm:text-[10px]"
  >
    <!-- 阅读进度：按章节切成六段，只在视觉上分段，进度本身仍是连续的 -->
    <div class="absolute inset-x-0 top-0 h-[2px]" aria-hidden="true">
      <div
        class="h-full bg-accent transition-[width] duration-200 ease-out"
        :style="{ width: `${percent}%` }"
      />
      <div class="progress-ticks absolute inset-0" />
    </div>

    <div class="flex h-full items-center justify-between gap-4 px-4 sm:px-10">
      <div class="flex min-w-0 items-center gap-3">
        <span class="flex shrink-0 items-center gap-1.5 text-accent">
          <span class="h-[5px] w-[5px] rounded-full bg-current" aria-hidden="true" />
          SYS.READY
        </span>
        <span class="hidden text-line-strong sm:inline" aria-hidden="true">|</span>
        <span class="truncate">
          <b class="font-bold text-ink">JDZone</b>
          <span class="hidden whitespace-nowrap min-[480px]:inline"> · Joint Discovery Zone</span>
        </span>
      </div>

      <span class="shrink-0">© 2026 JDZone.top</span>
    </div>

    <span class="sr-only">当前阅读进度 {{ percent }}%</span>
  </footer>
</template>
