import type { SectionMeta, SiteMeta } from '@/types/site'

/** 品牌与全局信息（保持参考页的文案口径） */
export const siteMeta: SiteMeta = {
  name: 'JDZone',
  fullName: 'Joint Discovery Zone',
  tagline: '一起发现 · 一起构建',
  description: 'JDZone 是一个专注软件工程实践的三⼈小组。我们在协作中打磨产品，在迭代中验证想法。',
  email: 'hello@JDZone.top',
  founded: '2026',
  version: 'v1.0.0',
  location: '中国 · UTC+8',
}

/**
 * 章节顺序即导航顺序，也是滚动吸附的顺序。
 * 编号只在「章节索引」这一处出现，用于建立阅读坐标，不当作装饰。
 */
export const sections: SectionMeta[] = [
  { id: 'home', index: '01', label: '首页', labelEn: 'HOME' },
  { id: 'about', index: '02', label: '关于', labelEn: 'ABOUT' },
  { id: 'members', index: '03', label: '成员', labelEn: 'OPERATORS' },
  { id: 'project', index: '04', label: '项目', labelEn: 'PROJECT' },
  { id: 'log', index: '05', label: '日志', labelEn: 'CHANGELOG' },
  { id: 'contact', index: '06', label: '联系', labelEn: 'CONTACT' },
]
