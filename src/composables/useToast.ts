import { readonly, ref } from 'vue'

export type ToastTone = 'success' | 'info'

export interface Toast {
  id: number
  message: string
  tone: ToastTone
}

/**
 * 轻量 Toast
 * ------------------------------------------------------------------
 * 复制成功、加载失败之类的短反馈用同一个队列，避免每个组件各写一套。
 * 最多同时显示 3 条，旧的自动让位给新提示。
 */
const toasts = ref<Toast[]>([])
const timers = new Map<number, number>()
let nextId = 0

const MAX_VISIBLE = 3
const DURATION = 2600

function dismissToast(id: number) {
  toasts.value = toasts.value.filter((toast) => toast.id !== id)
  const timer = timers.get(id)
  if (timer) {
    window.clearTimeout(timer)
    timers.delete(id)
  }
}

function showToast(message: string, tone: ToastTone = 'success') {
  const id = ++nextId
  const next = [...toasts.value, { id, message, tone }]

  // 超出上限时丢弃最早的一条（其定时器会自然到期，无需额外处理）
  while (next.length > MAX_VISIBLE) next.shift()

  toasts.value = next
  timers.set(
    id,
    window.setTimeout(() => dismissToast(id), DURATION),
  )

  return id
}

export function useToast() {
  return {
    toasts: readonly(toasts),
    showToast,
    dismissToast,
  }
}
