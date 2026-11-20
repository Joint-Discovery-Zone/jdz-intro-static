import { createApp } from 'vue'

// 字体只引入用到的字重与 latin 子集：
// 中文由系统字体承担，避免把 cyrillic / greek 等用不到的字形打进产物。
import '@fontsource/oswald/latin-500.css'
import '@fontsource/oswald/latin-700.css'
import '@fontsource/archivo-black/latin-400.css'
import '@fontsource/jetbrains-mono/latin-400.css'
import '@fontsource/jetbrains-mono/latin-500.css'
import './assets/styles/main.css'

import App from './App.vue'
import { vReveal } from './directives/reveal'
import { loadSiteContent } from './services/content'

/**
 * 应用入口
 * ------------------------------------------------------------------
 * 内容先经过服务层加载（当前是静态数据，接入后端后是同一接口），
 * 拿到数据再挂载，避免组件内部出现零散的加载状态。
 */
loadSiteContent()
  .then((content) => {
    const app = createApp(App, { content })
    app.directive('reveal', vReveal)
    app.mount('#app')
  })
  .catch((error: unknown) => {
    console.error('[app] 初始化失败', error)
    const root = document.getElementById('app')
    if (root) {
      root.textContent = '页面加载失败，请刷新重试。'
    }
  })
