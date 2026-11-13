import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

export type BootPhase = 'loading' | 'exiting' | 'done'

/**
 * 启动页进度
 * ------------------------------------------------------------------
 * 进度不是假的「随机等待」：它绑定一次真实的准备动画，
 * 用时约 1 秒，随时可以点击跳过。减弱动效模式下直接结束。
 */
export function useBoot(duration = 1000) {
  const reduced = useReducedMotion()
  const progress = ref(0)
  const phase = ref<BootPhase>('loading')
  const isBooting = computed(() => phase.value !== 'done')

  let frame = 0
  let hideTimer = 0
  let startedAt = 0

  /** 与 .boot-shutter 的动画时长保持一致（见 main.css） */
  const SHUTTER_MS = 620

  function cancelFrame() {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  function clearHideTimer() {
    if (hideTimer) window.clearTimeout(hideTimer)
    hideTimer = 0
  }

  /** 开始退场：进度补满，遮罩上滑，动画结束后卸载 */
  function exit() {
    if (phase.value !== 'loading') return
    cancelFrame()
    progress.value = 100
    phase.value = 'exiting'
    clearHideTimer()
    hideTimer = window.setTimeout(() => {
      phase.value = 'done'
    }, SHUTTER_MS)
  }

  function tick(now: number) {
    const elapsed = now - startedAt
    const ratio = Math.min(elapsed / duration, 1)
    // easeOutCubic：前段快、后段慢，读起来像在等真实工作完成
    const eased = 1 - Math.pow(1 - ratio, 3)
    progress.value = Math.min(99, Math.round(eased * 100))

    if (ratio >= 1) {
      exit()
      return
    }

    frame = requestAnimationFrame(tick)
  }

  onMounted(() => {
    if (reduced.value) {
      progress.value = 100
      phase.value = 'exiting'
      hideTimer = window.setTimeout(() => {
        phase.value = 'done'
      }, 120)
      return
    }

    startedAt = performance.now()
    frame = requestAnimationFrame(tick)
  })

  onBeforeUnmount(() => {
    cancelFrame()
    clearHideTimer()
  })

  /** 键盘或点击跳过，立即进入退场 */
  function skip() {
    if (phase.value !== 'loading') return
    clearHideTimer()
    exit()
  }

  return { progress, phase, isBooting, skip }
}
