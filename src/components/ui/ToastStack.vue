<script setup lang="ts">
import { PhX } from '@phosphor-icons/vue'
import { useToast } from '@/composables/useToast'

/**
 * 全局提示队列
 * 参考页是居中的深色等宽提示条，这里保持一致；
 * 多条提示纵向堆叠，最多三条，点击右侧按钮可提前关闭。
 */
const { toasts, dismissToast } = useToast()
</script>

<template>
  <div
    class="pointer-events-none fixed left-1/2 top-1/2 z-[90] w-max max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2"
    aria-label="操作提示"
  >
    <TransitionGroup name="toast" tag="div" class="flex flex-col items-center gap-2">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="status"
        class="pointer-events-auto flex items-center gap-3 notch-sm border border-line bg-ink px-6 py-3 text-paper shadow-[0_8px_30px_rgba(0,0,0,0.16)]"
      >
        <span
          class="h-1.5 w-1.5 shrink-0 rounded-full"
          :class="toast.tone === 'success' ? 'bg-signal' : 'bg-accent'"
          aria-hidden="true"
        />

        <p class="font-mono text-[12px] font-bold leading-4 tracking-[0.15em]">{{ toast.message }}</p>

        <button
          type="button"
          class="-mr-1 grid h-5 w-5 shrink-0 cursor-pointer place-items-center text-paper/60 transition-colors hover:text-paper focus-visible:text-paper"
          :aria-label="`关闭提示：${toast.message}`"
          @click="dismissToast(toast.id)"
        >
          <PhX :size="11" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
