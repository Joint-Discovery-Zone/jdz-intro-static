/**
 * 内容出口
 *
 * 视图层只从这里取数据。接入后端时可以保留这个文件，
 * 把静态导入换成服务层请求，页面组件不需要跟着改。
 */
import type { SiteContent } from '@/types/site'
import { sections, siteMeta } from './site'
import { members, principles } from './members'
import { project } from './project'
import { logEntries } from './log'
import { contactChannels } from './contact'

export const siteContent: SiteContent = {
  meta: siteMeta,
  sections,
  members,
  principles,
  project,
  log: logEntries,
  contact: contactChannels,
}

export { sections, siteMeta, members, principles, project, logEntries, contactChannels }
