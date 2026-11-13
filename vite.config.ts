/**
 * Vite 构建配置
 *
 * 说明：
 * - 站点当前是纯静态 SPA，构建产物直接放到 Netlify 的 dist 目录即可。
 * - 预留了 VITE_API_BASE_URL（见 .env.example），将来接入后端时只改环境变量，
 *   不用动构建配置。
 */
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],

  resolve: {
    alias: {
      // 全项目统一使用 @/ 前缀引用 src，避免出现 ../../.. 这类难读的路径
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    target: 'es2020',
    // 资源指纹文件名，配合 Netlify 的 immutable 缓存头，实现长期缓存
    assetsDir: 'assets',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        // 手动分包：框架代码与图标库分开，业务代码更新时不会让整包失效
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@phosphor-icons')) return 'icons'
            if (id.includes('vue') || id.includes('@vue')) return 'vue'
            return 'vendor'
          }
        },
      },
    },
  },

  server: {
    port: 5173,
    host: '127.0.0.1',
  },

  preview: {
    port: 4173,
    host: '127.0.0.1',
  },
})
