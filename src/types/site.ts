/**
 * 站点内容的数据契约
 *
 * 页面组件只依赖这些类型，不直接依赖某个数据文件。
 * 将来接入后端时，只要让服务层返回同样结构的数据，视图无需改动。
 */

/** 六个章节的固定标识，同时用于导航与滚动定位 */
export type SectionId = 'home' | 'about' | 'members' | 'project' | 'log' | 'contact'

/** 章节元信息：编号、中文名、英文名 */
export interface SectionMeta {
  id: SectionId
  index: string
  label: string
  labelEn: string
}

export interface SiteMeta {
  name: string
  fullName: string
  tagline: string
  description: string
  email: string
  founded: string
  version: string
  location: string
}

/** 成员档案：字段与参考页的档案板一一对应 */
export interface Member {
  id: string
  /** 两位编号，例如 01 */
  serial: string
  /** 展示用小写名，例如 zeionl */
  nameCn: string
  /** 大写展示名，例如 ZEIONL */
  nameEn: string
  /** 英文职能，例如 ENGINEERING */
  role: string
  /** 没有照片时用于档案板的首字母 */
  letter: string
  desc: string
  tags: string[]
}

/** 工作原则：关于页右侧的 + 列表 */
export interface Principle {
  index: string
  title: string
  body: string
}

export type PhaseState = 'done' | 'current' | 'next'

export interface ProjectPhase {
  index: string
  title: string
  state: PhaseState
}

/** 项目档案 */
export interface Project {
  status: string
  statusEn: string
  lead: string
  body: string
  tags: string[]
  phases: ProjectPhase[]
}

/** 开发日志：date 是状态标签（CURRENT / PLANNING / ARCHIVED） */
export interface LogEntry {
  id: string
  date: string
  title: string
  body: string
}

export type ContactAction = 'copy' | 'link' | 'static'

export interface ContactChannel {
  id: string
  /** 读屏用的中文名 */
  label: string
  /** 版面上的等宽标签，例如 DOMAIN */
  labelEn: string
  value: string
  href?: string
  action: ContactAction
}

/** 页面渲染所需的完整内容 */
export interface SiteContent {
  meta: SiteMeta
  sections: SectionMeta[]
  members: Member[]
  principles: Principle[]
  project: Project
  log: LogEntry[]
  contact: ContactChannel[]
}
