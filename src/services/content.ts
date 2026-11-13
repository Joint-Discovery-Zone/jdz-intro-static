import type { SiteContent } from '@/types/site'
import { siteContent } from '@/data'

/**
 * 内容服务
 * ------------------------------------------------------------------
 * 当前：直接返回打包进产物的静态内容，构建后无需任何后端。
 * 以后：配置 VITE_API_BASE_URL 后自动改为请求 `${API}/site`，
 *       接口返回与 SiteContent 相同的结构即可，页面组件不用改。
 *
 * 之所以把这件事放在服务层而不是组件里，是为了让「数据从哪来」
 * 只有一个入口，迁移时不用全局搜索 fetch。
 */

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '')

/** 后端不可用时的兜底：静态内容始终可用，避免整站白屏 */
async function loadRemoteContent(): Promise<SiteContent> {
  const response = await fetch(`${apiBaseUrl}/site`, {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(`内容接口返回 ${response.status}`)
  }

  return (await response.json()) as SiteContent
}

export async function loadSiteContent(): Promise<SiteContent> {
  if (!apiBaseUrl) return siteContent

  try {
    return await loadRemoteContent()
  } catch (error) {
    // 接后端初期允许降级到静态内容，同时在控制台留下可排查的记录
    console.warn('[content] 远程内容加载失败，已回退到静态内容。', error)
    return siteContent
  }
}
