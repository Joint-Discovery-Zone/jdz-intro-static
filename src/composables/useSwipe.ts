import { onBeforeUnmount, onMounted, type Ref } from 'vue'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

interface SwipeOptions {
  /** 触发滑动的最小水平距离（px） */
  threshold?: number
  /** 落在这些元素上的手势不参与切换，避免抢走按钮的点击 */
  ignoreSelector?: string
}

/**
 * 横向滑动
 * ------------------------------------------------------------------
 * 只处理水平位移明显大于垂直位移的手势，纵向滚动不受影响。
 * 成员的切换同时提供按钮和键盘操作，滑动是第三种可选方式。
 */
export function useSwipe(
  target: Ref<HTMLElement | null>,
  handlers: SwipeHandlers,
  options: SwipeOptions = {},
) {
  const threshold = options.threshold ?? 48
  const ignoreSelector = options.ignoreSelector ?? 'a, button, input, textarea, select, [role="tab"]'

  let element: HTMLElement | null = null
  let startX = 0
  let startY = 0
  let activePointer: number | null = null

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const targetNode = event.target as HTMLElement | null
    if (targetNode?.closest(ignoreSelector)) return

    startX = event.clientX
    startY = event.clientY
    activePointer = event.pointerId
  }

  function onPointerUp(event: PointerEvent) {
    if (activePointer === null || event.pointerId !== activePointer) return

    const deltaX = event.clientX - startX
    const deltaY = event.clientY - startY
    activePointer = null

    // 位移太短，或者更像一次纵向滚动，都不切换
    if (Math.abs(deltaX) < threshold || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return

    if (deltaX < 0) handlers.onSwipeLeft?.()
    else handlers.onSwipeRight?.()
  }

  function onPointerCancel() {
    activePointer = null
  }

  onMounted(() => {
    element = target.value
    if (!element) return

    element.addEventListener('pointerdown', onPointerDown, { passive: true })
    // 在 window 上收尾，指针移出卡片后仍能正确判定
    window.addEventListener('pointerup', onPointerUp, { passive: true })
    window.addEventListener('pointercancel', onPointerCancel, { passive: true })
  })

  onBeforeUnmount(() => {
    element?.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
  })
}
