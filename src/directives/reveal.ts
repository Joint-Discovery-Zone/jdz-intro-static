import type { Directive } from 'vue'

export type RevealVariant = 'up' | 'fade' | 'left' | 'right' | 'scale'
export type RevealBinding = number | { delay?: number; variant?: RevealVariant } | undefined

/** 每个元素只观察一次，进入视口后立即断开，避免长期占用回调 */
const observers = new WeakMap<HTMLElement, IntersectionObserver>()
/** 等开机动画结束的挂起清理函数，元素提前卸载时也要撤销 */
const pending = new WeakMap<HTMLElement, () => void>()

/**
 * v-reveal 入场指令
 * ------------------------------------------------------------------
 * 用法：
 *   v-reveal                  默认上移淡入
 *   v-reveal="120"            延迟 120ms
 *   v-reveal="{ variant: 'fade', delay: 80 }"
 *
 * 样式在 main.css 的 [data-reveal] 规则里，指令只负责观察与加类。
 * 开机层还在时先挂起，等 App 发出 jdz:boot-done 再开始观察；
 * 否则首屏动画会在遮罩背后播完，用户只看到静止画面。
 */
export const vReveal: Directive<HTMLElement, RevealBinding> = {
  mounted(el, binding) {
    const value = binding.value
    const delay = typeof value === 'number' ? value : (value?.delay ?? 0)
    const variant = typeof value === 'object' && value?.variant ? value.variant : 'up'

    el.dataset.reveal = variant
    el.style.setProperty('--reveal-delay', `${delay}ms`)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced || typeof IntersectionObserver === 'undefined') {
      el.classList.add('is-visible')
      return
    }

    let timer = 0
    let bootListener: (() => void) | null = null

    const cleanupGate = () => {
      if (bootListener) window.removeEventListener('jdz:boot-done', bootListener)
      bootListener = null
      window.clearTimeout(timer)
      pending.delete(el)
    }

    const startObserving = () => {
      cleanupGate()

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return
          el.classList.add('is-visible')
          observer.disconnect()
          observers.delete(el)
        },
        {
          threshold: 0.12,
          rootMargin: '0px 0px -6% 0px',
        },
      )

      observer.observe(el)
      observers.set(el, observer)
    }

    if (document.documentElement.classList.contains('booting')) {
      bootListener = () => startObserving()
      window.addEventListener('jdz:boot-done', bootListener, { once: true })
      // 万一事件没有发出（异常退出、被卸载），仍然在 2.6s 后开始观察
      timer = window.setTimeout(startObserving, 2600)
      pending.set(el, cleanupGate)
    } else {
      startObserving()
    }
  },

  unmounted(el) {
    pending.get(el)?.()
    pending.delete(el)
    observers.get(el)?.disconnect()
    observers.delete(el)
  },
}
