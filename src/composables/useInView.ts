import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

interface InViewOptions {
  threshold?: number
  rootMargin?: string
  /** 默认只触发一次，用于打字机等一次性动效 */
  once?: boolean
}

/**
 * 元素是否进入视口
 * 与 v-reveal 指令互补：指令负责样式，这个组合式函数负责业务侧的触发。
 */
export function useInView(target: Ref<Element | null>, options: InViewOptions = {}) {
  const inView = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value || typeof IntersectionObserver === 'undefined') {
      inView.value = true
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return

        if (entry.isIntersecting) {
          inView.value = true
          if (options.once !== false) observer?.disconnect()
        } else if (options.once === false) {
          inView.value = false
        }
      },
      {
        threshold: options.threshold ?? 0.25,
        rootMargin: options.rootMargin,
      },
    )

    observer.observe(target.value)
  })

  onBeforeUnmount(() => observer?.disconnect())

  return { inView }
}
