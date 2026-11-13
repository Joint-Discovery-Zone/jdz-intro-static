import type { Project } from '@/types/site'

/**
 * 项目进展
 * 保持参考页的五阶段路线图与「开发中」状态；
 * 阶段状态用形状、文案和颜色三重表达，不依赖颜色单独传达。
 */
export const project: Project = {
  status: '开发中',
  statusEn: 'IN PROGRESS',
  lead: '项目正在定义问题与最小可行版本。当前阶段聚焦核心功能原型与协作流程搭建，后续会持续更新进展。',
  body: '我们优先验证最关键的一条链路，再逐步补齐能力。技术选型会在 MVP 范围明确后定型。',
  tags: ['FRONTEND', 'BACKEND', 'DATABASE', 'GIT', 'CI/CD'],
  phases: [
    { index: '01', title: '需求梳理', state: 'done' },
    { index: '02', title: '原型与视觉方案', state: 'done' },
    { index: '03', title: 'MVP 开发', state: 'current' },
    { index: '04', title: '测试与联调', state: 'next' },
    { index: '05', title: '发布', state: 'next' },
  ],
}
