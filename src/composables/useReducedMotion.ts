import { readonly, ref } from 'vue'

/**
 * 是否开启「减弱动态效果」
 * 整个站点只订阅一次系统设置，组件按需读取。
 */
const mediaQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null

const reducedMotion = ref(mediaQuery?.matches ?? false)

mediaQuery?.addEventListener('change', (event) => {
  reducedMotion.value = event.matches
})

export function useReducedMotion() {
  return readonly(reducedMotion)
}
