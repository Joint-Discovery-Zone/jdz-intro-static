import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { useReducedMotion } from './useReducedMotion'

/**
 * 章节导航
 * ------------------------------------------------------------------
 * - IntersectionObserver 以视口中线为判定区，滚到哪一章就激活哪一项
 * - 同时提供当前章节索引与整页滚动进度，供侧边导航和底部状态栏共用
 * - 主动跳转只滚动 .scroller 自身，不碰文档，避免带动固定页眉与懒加载观察器
 */
export function useSectionNav(scroller: Ref<HTMLElement | null>, sectionIds: readonly string[]) {
  const reduced = useReducedMotion()
  const activeIndex = ref(0)
  /** 0 到 1 的滚动进度，用于底部细进度条 */
  const progress = ref(0)

  let observer: IntersectionObserver | null = null
  let resizeObserver: ResizeObserver | null = null
  let scrollFrame = 0

  function measureProgress() {
    const el = scroller.value
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    progress.value = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
  }

  function handleScroll() {
    if (scrollFrame) return
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = 0
      measureProgress()
    })
  }

  function connect() {
    const root = scroller.value
    if (!root || observer) return

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = sectionIds.indexOf(entry.target.id)
          if (index >= 0) activeIndex.value = index
        }
      },
      {
        root,
        // 只留视口中间 10% 的判定带，避免相邻两章同时激活
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0,
      },
    )

    for (const id of sectionIds) {
      const section = root.querySelector<HTMLElement>(`#${id}`)
      if (section) observer.observe(section)
    }

    root.addEventListener('scroll', handleScroll, { passive: true })
    measureProgress()

    // 懒加载章节挂载后页面会变高。监听每个章节的高度变化，
    // 否则停在页尾时进度条会一直停留在旧的 100%。
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(handleScroll)
      for (const section of Array.from(root.children)) {
        resizeObserver.observe(section)
      }
    }
  }

  onMounted(() => {
    // 等懒加载的外层 section 渲染完成后再观察
    void nextTick(connect)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    resizeObserver?.disconnect()
    resizeObserver = null
    scroller.value?.removeEventListener('scroll', handleScroll)
    if (scrollFrame) cancelAnimationFrame(scrollFrame)
  })

  function scrollToIndex(index: number, behavior?: ScrollBehavior) {
    const el = scroller.value
    const clamped = Math.min(Math.max(index, 0), sectionIds.length - 1)
    const target = el?.querySelector<HTMLElement>(`#${sectionIds[clamped] ?? ''}`)
    if (!el || !target) return

    // 用相对位置计算滚动目标，兼容外层容器和页眉偏移
    const top = target.getBoundingClientRect().top - el.getBoundingClientRect().top + el.scrollTop

    activeIndex.value = clamped
    el.scrollTo({
      top,
      behavior: behavior ?? (reduced.value ? 'auto' : 'smooth'),
    })
  }

  function scrollToId(id: string, behavior?: ScrollBehavior) {
    const index = sectionIds.indexOf(id)
    if (index >= 0) scrollToIndex(index, behavior)
  }

  return { activeIndex, progress, scrollToIndex, scrollToId }
}
