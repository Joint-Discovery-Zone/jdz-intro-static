import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

export type BootPhase = 'loading' | 'exiting' | 'done'

/**
 * 启动页进度
 * ------------------------------------------------------------------
 * 进度绑定一次短准备动画，默认最多 820ms；
 * 字体等关键资源就绪后，外部可以调用 finish() 提前退场（最低保留 600ms）。
 * 点击 / Esc 随时跳过；减弱动效模式下直接结束。
 */
export function useBoot(duration = 820) {
  const reduced = useReducedMotion()
  const progress = ref(0)
  const phase = ref<BootPhase>('loading')
  const isBooting = computed(() => phase.value !== 'done')

  let frame = 0
  let hideTimer = 0
  let startedAt = 0
  let disposed = false

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
    if (disposed || phase.value !== 'loading') return
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
    disposed = true
    cancelFrame()
    clearHideTimer()
  })

  /** 资源就绪时提前收尾；App 会保证至少展示一小段开场，避免闪一下。 */
  function finish() {
    if (phase.value === 'loading') exit()
  }

  /** 键盘或点击跳过，立即进入退场 */
  function skip() {
    if (phase.value !== 'loading') return
    clearHideTimer()
    exit()
  }

  return { progress, phase, isBooting, skip, finish }
}
