import type { ContactChannel } from '@/types/site'

/**
 * 联系方式
 * 前三个格子点击复制，最后一个只展示状态；
 * 示例值上线前替换成小组真实域名与邮箱。
 */
export const contactChannels: ContactChannel[] = [
  {
    id: 'domain',
    label: '域名',
    labelEn: 'DOMAIN',
    value: 'JDZone.top',
    action: 'copy',
  },
  {
    id: 'email',
    label: '邮箱',
    labelEn: 'EMAIL',
    value: 'hello@JDZone.top',
    action: 'copy',
  },
  {
    id: 'github',
    label: 'GitHub',
    labelEn: 'GITHUB',
    value: 'github.com/JDZone',
    action: 'copy',
  },
  {
    id: 'status',
    label: '状态',
    labelEn: 'STATUS',
    value: '开发中',
    action: 'static',
  },
]
