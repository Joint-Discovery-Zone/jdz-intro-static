import { computed, readonly, ref } from 'vue'

/**
 * 主题切换
 * ------------------------------------------------------------------
 * 参考页的切换依赖 CSS transitionend 才写入 data-theme，
 * 过渡被打断、系统开启「减弱动效」或浏览器不触发事件时，
 * 页面会停在旧主题，只剩图标变化。这里把状态提交与动画解耦：
 *
 * 1. 先创建一层铺满视口的「新主题底色」遮罩；
 * 2. 从按钮位置扩散圆形裁切，遮住旧页面；
 * 3. 动画完成（或 850ms 兜底）后原子地切换 data-theme 并移除遮罩；
 * 4. 任何一步失败都仍然提交主题，保证按钮永远有效。
 *
 * 状态放在模块作用域，多个组件共享同一个主题。
 */
export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'jdz-theme'

function readTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

const theme = ref<Theme>(readTheme())
const isDark = computed(() => theme.value === 'dark')

/** 防止一次过渡还没结束又叠一层遮罩 */
let switching = false

function applyTheme(next: Theme, persist = true) {
  theme.value = next

  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = next
    // 让浏览器原生控件（滚动条、表单）跟随主题
    document.documentElement.style.colorScheme = next

    // 移动端地址栏颜色也同步，避免切到深色后顶部仍是浅色
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', next === 'dark' ? '#05080c' : '#eef1f2')
  }

  if (!persist) return

  try {
    localStorage.setItem(STORAGE_KEY, next)
  } catch {
    // 隐私模式下可能无法写入，忽略即可，本次会话仍然生效
  }
}

// 首次加载：保证状态与内联脚本预设的主题一致
if (typeof document !== 'undefined') applyTheme(theme.value, false)

export function useTheme() {
  function setTheme(next: Theme) {
    applyTheme(next)
  }

  /**
   * @param origin 点击位置，用于圆形揭示的圆心（通常是按钮中心）
   */
  function toggle(origin?: { x: number; y: number }) {
    if (switching) return

    const next: Theme = isDark.value ? 'light' : 'dark'
    const reduced =
      typeof window === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (typeof document === 'undefined') {
      applyTheme(next)
      return
    }

    /*
     * 减弱动效：不做全屏圆形扩张，但仍保留一次 220ms 的旧底色淡出，
     * 让「按下之后发生了什么」有可见反馈，而不是瞬间跳变。
     */
    if (reduced) {
      const flash = document.createElement('div')
      flash.className = 'theme-flash'
      flash.setAttribute('aria-hidden', 'true')
      flash.style.background = isDark.value ? '#05080c' : '#eef1f2'
      document.body.appendChild(flash)

      applyTheme(next)

      const fade = flash.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 220,
        easing: 'ease-out',
        fill: 'forwards',
      })
      const removeFlash = () => flash.remove()
      fade.finished.then(removeFlash).catch(removeFlash)
      window.setTimeout(removeFlash, 400)
      return
    }

    const x = origin?.x ?? window.innerWidth - 32
    const y = origin?.y ?? 24
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    const overlay = document.createElement('div')
    overlay.className = 'theme-wipe'
    overlay.dataset.to = next
    overlay.setAttribute('aria-hidden', 'true')
    overlay.style.clipPath = `circle(0px at ${x}px ${y}px)`
    overlay.style.setProperty('--wipe-x', `${x}px`)
    overlay.style.setProperty('--wipe-y', `${y}px`)
    overlay.style.setProperty('--wipe-r', `${radius}px`)

    /*
     * HUD 层独立于圆形遮罩，不参与 clip-path 裁切：
     * 网格、扫描线、描边、准星和模式标签从第一帧就可见，
     * 不会出现「只看到一块纯色圆在扩张」的单调感。
     */
    const fx = document.createElement('div')
    fx.className = 'theme-fx'
    fx.dataset.from = isDark.value ? 'dark' : 'light'
    fx.setAttribute('aria-hidden', 'true')
    fx.style.setProperty('--wipe-x', `${x}px`)
    fx.style.setProperty('--wipe-y', `${y}px`)
    fx.style.setProperty('--wipe-r', `${radius}px`)

    const grid = document.createElement('span')
    grid.className = 'theme-fx__grid'
    const scan = document.createElement('span')
    scan.className = 'theme-fx__scan'
    const ring = document.createElement('span')
    ring.className = 'theme-fx__ring'
    const cross = document.createElement('span')
    cross.className = 'theme-fx__cross'
    const label = document.createElement('span')
    label.className = 'theme-fx__label'
    label.textContent = next === 'dark' ? 'NIGHT MODE · 夜间模式' : 'DAYLIGHT · 日间模式'

    fx.append(grid, scan, ring, cross, label)
    document.body.appendChild(overlay)
    document.body.appendChild(fx)

    switching = true
    let committed = false

    const commit = () => {
      if (committed) return
      committed = true
      applyTheme(next)
      // 遮罩与新主题同色，停留一拍再移除，避免切换瞬间露出旧帧
      window.setTimeout(() => {
        overlay.remove()
        fx.remove()
      }, 90)
      switching = false
    }

    // WAAPI 不依赖 transitionend，动画被打断也能走 catch 提交状态
    const animation = overlay.animate(
      [
        { clipPath: `circle(0px at ${x}px ${y}px)` },
        { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
      ],
      { duration: 820, easing: 'cubic-bezier(.68,0,.24,1)', fill: 'forwards' },
    )

    ring.animate(
      [
        { transform: 'scale(0.04)', opacity: 0.9 },
        { transform: 'scale(1.02)', opacity: 0 },
      ],
      { duration: 820, easing: 'cubic-bezier(.68,0,.24,1)', fill: 'forwards' },
    )

    label.animate(
      [
        { opacity: 0, transform: 'translate(-50%, -50%) scale(0.92)', offset: 0 },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.28 },
        { opacity: 1, transform: 'translate(-50%, -50%) scale(1)', offset: 0.72 },
        { opacity: 0, transform: 'translate(-50%, -50%) scale(1.03)', offset: 1 },
      ],
      { duration: 820, easing: 'ease-out', fill: 'forwards' },
    )

    animation.finished.then(commit).catch(commit)

    // 极端情况下（标签页切到后台、动画被浏览器丢弃）兜底提交
    window.setTimeout(commit, 1100)
  }

  return {
    theme: readonly(theme),
    isDark,
    toggle,
    setTheme,
  }
}
