import { onBeforeUnmount, ref } from 'vue'

export type CopyStatus = 'idle' | 'copied' | 'error'

/**
 * 复制到剪贴板
 * ------------------------------------------------------------------
 * Clipboard API 在非安全上下文（http）下不可用，因此保留一个
 * 基于临时 textarea 的降级方案，保证本地预览时也能复制。
 */
function copyWithFallback(text: string): boolean {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-9999px'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()

  let succeeded = false
  try {
    succeeded = document.execCommand('copy')
  } catch {
    succeeded = false
  }

  area.remove()
  return succeeded
}

export function useClipboard(resetAfter = 2200) {
  const status = ref<CopyStatus>('idle')
  let timer = 0

  function resetLater() {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => {
      status.value = 'idle'
    }, resetAfter)
  }

  async function copy(text: string): Promise<boolean> {
    let succeeded = false

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        succeeded = true
      } else {
        succeeded = copyWithFallback(text)
      }
    } catch {
      // 权限被拒绝时再试一次降级方案
      succeeded = copyWithFallback(text)
    }

    status.value = succeeded ? 'copied' : 'error'
    resetLater()
    return succeeded
  }

  onBeforeUnmount(() => {
    if (timer) window.clearTimeout(timer)
  })

  return { status, copy }
}
