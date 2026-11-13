import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

/**
 * 打字机效果
 * ------------------------------------------------------------------
 * - 只在元素进入视口后开始（由调用方传入 active）
 * - 开始后只执行一次，不因滚动来回重复播放
 * - 减弱动效模式下直接显示完整文本
 */
export function useTypewriter(
  text: string,
  active: Ref<boolean>,
  options: { charDelay?: number; startDelay?: number } = {},
) {
  const output = ref('')
  const done = ref(false)
  const reduced = useReducedMotion()

  let timer = 0

  function stop() {
    if (timer) window.clearTimeout(timer)
    timer = 0
  }

  function start() {
    stop()
    if (done.value) return

    if (reduced.value) {
      output.value = text
      done.value = true
      return
    }

    let index = 0
    const step = () => {
      index += 1
      output.value = text.slice(0, index)

      if (index >= text.length) {
        done.value = true
        return
      }

      timer = window.setTimeout(step, options.charDelay ?? 55)
    }

    timer = window.setTimeout(step, options.startDelay ?? 260)
  }

  watch(
    active,
    (isActive) => {
      if (isActive) start()
    },
    { immediate: true },
  )

  onBeforeUnmount(stop)

  return { output, done }
}
