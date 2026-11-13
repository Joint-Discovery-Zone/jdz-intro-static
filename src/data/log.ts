import type { LogEntry } from '@/types/site'

/** 开发日志：按参考页的状态标签与顺序排列 */
export const logEntries: LogEntry[] = [
  {
    id: 'members-project',
    date: 'CURRENT',
    title: '成员页与项目页开发',
    body: '搭建页面结构与内容配置，完善分页滚动交互与视觉细节。',
  },
  {
    id: 'stack',
    date: 'PLANNING',
    title: '技术栈定型',
    body: '根据 MVP 范围确定前后端技术选型。',
  },
  {
    id: 'information-architecture',
    date: 'ARCHIVED',
    title: '信息架构与视觉方向',
    body: '确定现代扁平基调与整屏滚动分页结构。',
  },
  {
    id: 'kickoff',
    date: 'ARCHIVED',
    title: '小组组建',
    body: 'zeionl、Dreverie、jeffrey 三人组队，确定组名 JDZone。',
  },
]
