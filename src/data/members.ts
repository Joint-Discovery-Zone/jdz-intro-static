import type { Member, Principle } from '@/types/site'

/**
 * 成员档案
 * 参考页没有成员照片，这里也不伪造人像：右侧用档案板承载首字母与编号。
 * 以后有真实图片时，给成员补 avatar（1:1 头像）与 visual（右侧大图）字段；
 * 缺省或加载失败会自动退回首字母 / 档案板，不会出现裂图或空洞。
 */
export const members: Member[] = [
  {
    id: 'zeionl',
    serial: '01',
    nameCn: 'zeionl',
    nameEn: 'ZEIONL',
    role: 'ENGINEERING',
    letter: 'Z',
    desc: '关注系统设计、代码结构与工程化实践，推动项目从原型走向可维护的产品。',
    tags: ['SYSTEM DESIGN', 'ARCHITECTURE', 'REFACTORING'],
  },
  {
    id: 'dreverie',
    serial: '02',
    nameCn: 'Dreverie',
    nameEn: 'DREVERIE',
    role: 'PRODUCT & UX',
    letter: 'D',
    desc: '关注需求定义、用户流程与交互细节，让每一次操作都有清晰的逻辑与舒适的反馈。',
    tags: ['PRODUCT STRATEGY', 'UX DESIGN', 'PROTOTYPING'],
  },
  {
    id: 'jeffrey',
    serial: '03',
    nameCn: 'jeffrey',
    nameEn: 'JEFFREY',
    role: 'DEVELOPMENT',
    letter: 'J',
    desc: '关注功能实现、测试覆盖与持续集成，确保交付的代码稳定可靠、易于维护。',
    tags: ['DEVELOPMENT', 'TESTING', 'CI/CD'],
  },
]

/** 工作原则：关于页右侧的 + 列表 */
export const principles: Principle[] = [
  {
    index: '01',
    title: '共同学习',
    body: '以项目为载体，把新技术真正用起来。',
  },
  {
    index: '02',
    title: '协作开发',
    body: 'Git 分支管理、代码评审、文档沉淀。',
  },
  {
    index: '03',
    title: '持续迭代',
    body: '小步提交，快速验证，稳定推进。',
  },
]
