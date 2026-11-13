<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import type { BootPhase } from '@/composables/useBoot'

/**
 * 启动动画
 * ------------------------------------------------------------------
 * 布局对齐参考页：四角括号、双层旋转圆环、菱形 JD、底部 TIP 与右侧进度。
 * 与参考页不同的是进度由 useBoot 驱动，最多 1 秒，且随时可以 Esc / 点击跳过，
 * 不会像原版那样用随机计时器把用户挡在门外。
 */
const props = defineProps<{
  progress: number
  phase: BootPhase
}>()

const emit = defineEmits<{ skip: [] }>()

const STATUSES = [
  'INITIALIZING CORE...',
  'LOADING ASSETS...',
  'CONNECTING TO SERVER...',
  'SYNCING DATA...',
  'RENDERING UI...',
  'READY',
] as const

const status = computed(() => {
  if (props.phase === 'exiting') return STATUSES[5]
  const p = props.progress
  if (p < 20) return STATUSES[0]
  if (p < 45) return STATUSES[1]
  if (p < 70) return STATUSES[2]
  if (p < 90) return STATUSES[3]
  return STATUSES[4]
})

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('skip')
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // 启动屏是焦点应该停留的地方，跳过按钮同时是键盘的第一落点
  document.getElementById('boot-skip')?.focus({ preventScroll: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div
    class="boot-grid fixed inset-0 z-[100000] flex flex-col items-center justify-center overflow-hidden bg-paper text-ink"
    :class="{ 'boot-shutter': phase === 'exiting' }"
    role="dialog"
    aria-modal="true"
    aria-label="JDZone 正在启动"
  >
    <!-- 四角括号 -->
    <span class="absolute left-10 top-10 h-10 w-10 border-l border-t border-line" aria-hidden="true" />
    <span class="absolute right-10 top-10 h-10 w-10 border-r border-t border-line" aria-hidden="true" />
    <span class="absolute bottom-10 left-10 h-10 w-10 border-b border-l border-line" aria-hidden="true" />
    <span class="absolute bottom-10 right-10 h-10 w-10 border-b border-r border-line" aria-hidden="true" />

    <!-- 中心：外圈 / 虚线内圈 / 菱形 -->
    <div class="relative grid h-[280px] w-[280px] place-items-center" aria-hidden="true">
      <span class="absolute inset-0 rounded-full border border-line">
        <span
          class="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_10px_var(--c-accent)]"
        />
      </span>
      <span class="boot-spin-reverse absolute inset-5 rounded-full border border-dashed border-line" />
      <span class="boot-diamond">
        <span class="block -rotate-45 font-display text-[32px] font-bold tracking-[0.1em] text-accent">
          JD
        </span>
      </span>
      <span class="absolute -bottom-10 font-display text-xl font-medium tracking-[0.5em] text-ink opacity-80">
        JDZONE
      </span>
    </div>

    <!-- 跳过：提前进入，键盘用户第一时间可以离开 -->
    <button
      id="boot-skip"
      type="button"
      class="absolute right-5 top-5 cursor-pointer border-b border-line-strong pb-0.5 font-mono text-[10px] tracking-[0.18em] text-muted transition-colors hover:border-accent hover:text-accent focus-clip sm:right-10 sm:top-8"
      @click="emit('skip')"
    >
      SKIP / 跳过
    </button>

    <!-- 底部信息 -->
    <div class="absolute inset-x-5 bottom-6 flex items-end justify-between gap-6 sm:inset-x-10 sm:bottom-10">
      <p class="hidden max-w-[60%] font-mono text-[11px] leading-relaxed tracking-[0.05em] text-muted sm:block">
        <span class="mr-2 text-accent">TIP //</span>
        协作是软件开发的核心，像拼图一样契合。
      </p>

      <div class="ml-auto flex flex-col items-end gap-2">
        <span class="font-mono text-[10px] tracking-[0.2em] text-muted" aria-live="polite">
          {{ status }}
        </span>
        <span class="font-display text-4xl font-bold leading-none tracking-[0.02em]">
          {{ Math.round(progress) }}%
        </span>
        <div
          class="h-[2px] w-[200px] max-w-[52vw] bg-line"
          role="progressbar"
          aria-label="启动进度"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="Math.round(progress)"
        >
          <div
            class="h-full bg-accent shadow-[0_0_8px_var(--c-accent)] transition-[width] duration-100 ease-linear"
            :style="{ width: `${progress}%` }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
