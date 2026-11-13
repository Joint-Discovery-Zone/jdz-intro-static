/**
 * Vue 的全局类型声明
 * - vite/client 提供 import.meta.env、静态资源导入等类型
 * - ImportMetaEnv 让环境变量有自动补全，拼错时能在类型检查阶段发现
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端 API 根地址；留空则使用静态内容 */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
