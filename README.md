# JDZone · Joint Discovery Zone

三个人组成的软件工程小组介绍站。当前版本以用户提供的科幻城市主视觉为基准做了电影感重构：全幅照片首屏、Archivo Black 巨型标题、酸性黄单一强调色、五个主章节加一个联系页。工程侧继续使用 Vue 3 + TypeScript + Tailwind CSS，内容、主题、导航、懒加载与后端接入都是可维护的独立模块。

当前是**纯静态站点**，构建产物可以直接部署到 Netlify、Cloudflare Pages 或任意静态托管；内容读取收敛在服务层，后续接 API 时页面组件不用改。

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` + TypeScript） |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS 4（`@theme inline` + CSS 变量） |
| 三维 | Three.js 0.187（WATCH INTRO 弹层里的点云字标，独立懒加载 chunk） |
| 图标 | `@phosphor-icons/vue` |
| 字体 | `@fontsource/archivo-black`、`@fontsource/oswald`、`@fontsource/jetbrains-mono`，本地托管、只打包 Latin 子集 |
| 部署 | Netlify（`netlify.toml` 已配置） |

没有引入路由。整站是单页六章节，导航由滚动容器、IntersectionObserver 与 `history.replaceState` 完成，减少一层依赖。

## 本地运行

要求 Node 22 及以上、pnpm 11（`packageManager` 已锁定版本）。

```bash
pnpm install
pnpm dev        # http://127.0.0.1:5173
pnpm build      # 先 vue-tsc 类型检查，再产出 dist/
pnpm preview    # 预览 dist，默认 http://127.0.0.1:4173
pnpm typecheck  # 只跑类型检查
```

> pnpm 11 默认不执行依赖的安装脚本。仓库里的 `pnpm-workspace.yaml` 只批准了 `esbuild`，Vite 需要它。若换用 npm，可以删除该文件。

## 设计说明

- **参考图优先**：首屏是从用户提供的 1672 × 941 主视觉做 1:1 重绘。原图里烘焙了旧站点的标题、按钮、页脚，构建时用带羽化的模糊遮罩清掉这些区域，再交给真实 DOM 排版；城市、环形结构、瀑布和云海保持不动。图片在 `public/images/hero-cinematic.jpg`。
- **首屏结构**：左侧三行 `JOINT / DISCOVERY / ZONE`，`ZONE` 后接黄色斜块；下方 `EXPLORE. CREATE. BEYOND.`、斜切 CTA、圆形 WATCH INTRO；底部 `01 / 05`、SCROLL DOWN、黄色角标与细底线。页眉是透明渐变，浅色主题下才切换为深色实底。
- **单一强调色**：默认深色主题以近黑 `#05080c` 为底，酸性黄 `#e8f33c` 只负责品牌线条、激活态和主要动作；浅色主题用橄榄绿 `#6c7600` 保证浅底可读。首屏照片始终深色，因此首屏与页眉始终使用酸性黄，不随主题变绿。
- **字体分工**：巨型标题用 Archivo Black，字重固定、字距收紧；章节标题用 Oswald；正文用系统无衬线；导航、索引、HUD 用 JetBrains Mono。所有字体自托管并只保留 Latin 子集。
- **章节结构**：五个主章节 `HOME / THE THREE / PROJECTS / JOURNAL / ABOUT`，联系页作为收尾的 `CONTACT`。首屏底部的 `01 / 05` 指五个主章节，联系页是独立的结束页。
- **滚动方式**：重构版去掉了强制 scroll-snap，改为自然滚动。导航由 IntersectionObserver 判断当前章节，`scrollIntoView` 与 hash 同步集中在一个 composable 中，减少移动端被吸附打断的情况。
- **主题切换**：`data-theme` 驱动 CSS 变量；`index.html` 内联脚本在样式加载前恢复主题，默认深色。切换时先铺目标主题底色，用 WAAPI 从按钮位置圆形扩散，并叠加独立的 HUD 网格、扫描线、描边环、准星和模式标签；动画完成或 1100ms 兜底后提交主题，不依赖 `transitionend`。
- **动效**：章节用 `v-reveal` 做位移、模糊和透明度复合入场，按阅读顺序错峰；首屏照片有轻微指针视差；按钮保留切角内描边、悬停上浮与鱼鳞式水波；WATCH INTRO 使用原生 dialog，关闭即销毁 Three.js 场景，避免后台持续跑 rAF。
- **Three.js 的边界**：点云字标只出现在 WATCH INTRO 里，不再占用首屏主视觉。约两万个点（移动端约九千）由代码碎片汇入，静止后只保留点阵与三条轨道节点；指针排斥通过射线反投影到字面平面，中心与光标对齐。减弱动效、WebGL 不可用或加载失败时自动落回 2D 点阵字。

## 目录结构

```text
src/
├─ App.vue                    # 应用外壳：滚动容器、章节导航、键盘、hash、启动层
├─ main.ts                    # 字体、样式、内容加载与挂载
├─ assets/styles/main.css     # 设计令牌、电影感首屏、章节表面、主题揭示与减弱动效
├─ types/site.ts              # 全站内容类型契约 SiteContent
├─ data/                      # 静态内容（成员、项目、日志、联系方式…）
├─ services/content.ts        # 内容读取入口：静态优先，可切到远程 API
├─ composables/               # 主题、启动、章节导航、复制、提示、滑动手势…
├─ directives/reveal.ts       # v-reveal 入场指令
└─ components/
   ├─ layout/                 # 页眉、页脚、移动菜单、懒加载外壳、启动层
   ├─ sections/               # 首页、关于、项目进展、开发日志、联系、首屏预告
   ├─ members/                # 成员档案（tablist + 滑动切换）与档案板
   ├─ background/             # 点阵字、Three.js 点云字标
   └─ ui/                     # 按钮、章节标题、主题开关、Toast、骨架屏…
```

## 修改内容

所有文案与成员信息都在 `src/data/`，结构由 `src/types/site.ts` 的 `SiteContent` 约束：

- `site.ts`：站点名、邮箱、章节列表（`label` 中文、`labelEn` 英文）
- `members.ts`：成员档案（`nameCn`、`nameEn`、`role`、`letter`、`desc`、`tags`）与三条工作原则
- `project.ts`：项目状态、两段说明、技术标签、五阶段及 `done/current/next` 状态
- `log.ts`：推进记录（`date` 为 CURRENT / PLANNING / ARCHIVED，`title`、`body`）
- `contact.ts`：四格联系信息；前三格 `action: 'copy'`，状态格 `action: 'static'`

新增成员时补一条 `Member` 即可，成员章节、首页名单和计数都从数据推导。改完运行 `pnpm typecheck`，类型会检查漏字段。

## 成员图片（预留）

现在数据里没有图片，界面自动退回首字母和档案板。以后要加头像与大图，先把文件放进 `public/images/members/`，再给成员补两个可选字段：

```ts
avatar: {
  src: '/images/members/zeionl-avatar.webp',
  alt: 'zeionl 的头像',
  focus: '50% 40%', // 可选，CSS object-position
},
visual: {
  src: '/images/members/zeionl-visual.webp',
  alt: 'zeionl 的视觉档案图',
  focus: '50% 50%',
},
```

- **头像 `avatar`**：建议 1:1、至少 400 × 400，WebP/AVIF，控制在 150 kB 内。它同时用于 60 px 的档案头像和三张 36 px 缩略图。
- **大图 `visual`**：建议 3:2 或 4:3、短边至少 1200 px，控制在 600 kB 内。桌面档案板约 840 × 320，会按 `object-fit: cover` 居中裁切，用 `focus` 指定保留区域。
- 头像在档案里保持彩色；缩略图默认灰度，当前成员或悬停时恢复彩色。大图在桌面作为档案板底图，默认灰度、悬停轻微恢复彩色；扫描线、首字母和 HUD 仍在图片之上。
- 大图只在 ≥ 960 px 的桌面布局出现；移动端保留头像和文字档案，避免把单屏节奏撑长。需要移动端也展示大图时，可以把 `MemberVisual` 放进移动布局，或加一个点开的大图查看器。
- 图片加载失败会自动回退：头像回到首字母，大图回到原来的矢量档案板，不会出现裂图。
- `alt` 写图片的实际内容；如果大图只是纹理、没有信息，可以传空字符串让它对读屏隐藏。

## 接入后端

内容读取只有一个入口：`src/services/content.ts`。

```ts
// 当前：VITE_API_BASE_URL 为空时直接返回打包好的静态内容
export async function loadSiteContent(): Promise<SiteContent>
```

接入步骤：

1. 在 Netlify（或 `.env.local`）配置 `VITE_API_BASE_URL=https://api.example.com`。
2. 后端提供 `GET /site`，返回与 `SiteContent` 相同的 JSON。
3. 接口失败时前端会自动回退到静态内容，并在控制台留一条 warning，不会白屏。
4. 跨域需要在 API 侧允许站点域名；`VITE_` 变量会进入前端产物，不能放密钥。

期望的响应形状（节选）：

```json
{
  "meta": { "name": "JDZone", "email": "hello@JDZone.top", "...": "..." },
  "sections": [{ "id": "home", "index": "01", "label": "首页", "labelEn": "HOME" }],
  "members": [{ "id": "zeionl", "nameCn": "zeionl", "nameEn": "ZEIONL", "role": "ENGINEERING", "...": "..." }],
  "principles": [],
  "project": { "status": "开发中", "phases": [] },
  "log": [],
  "contact": []
}
```

需要登录、表单或 CMS 时，优先加 Netlify Functions 作为轻量后端；这个站点的类型与服务层可以直接复用。若之后章节变多、需要独立 URL，再引入 `vue-router`，当前 hash 逻辑集中在 `App.vue`，迁移成本可控。

## 性能与加载

- **首屏最小化**：首页同步打包，其余五章由 `LazySection` 在距离视口 1200px 时动态 `import()`，加载中显示同尺寸骨架屏；首屏空闲后再预取全部章节，避免滚动时插入骨架造成跳动。
- **主视觉**：`hero-cinematic.jpg` 为 1672 × 941、约 183 kB，`fetchpriority="high"`、`decoding="async"`，构建后原样进入 `dist/images/`。
- **字体本地化 + 子集化**：Archivo Black 400、Oswald 500/700、JetBrains Mono 400/500 的 Latin 子集，构建后共 10 个字体文件，不请求第三方字体服务。
- **拆分稳定依赖**：Vite `manualChunks` 把 Vue、图标、Three.js、其余 vendor 分开，业务代码更新时缓存不失效。
- **Three.js 按需加载**：`three` 是独立 chunk（约 753 kB / gzip 193 kB），只在打开 WATCH INTRO 时动态 `import()`；关闭弹层即销毁场景。移动端采样步长更大（约 9 千点），桌面约 2 万点。
- **主题不闪白**：`index.html` 内联脚本在首屏绘制前写 `data-theme` 与 `color-scheme`。
- **入场动画**：`v-reveal` 用 IntersectionObserver，只触发一次；无 JS 时内容直接可见。
- **主题切换无阻塞**：遮罩层动画不等待 CSS 过渡事件，动画完成、失败或超时都会提交状态；减弱动效时改为 220ms 旧底色淡出。
- 当前生产包约：入口 JS 56 kB（gzip 21 kB）、Vue 78 kB（gzip 31 kB）、图标 23 kB（gzip 5.5 kB）、CSS 57 kB（gzip 12 kB），五个懒加载章节各 1.3 至 9.6 kB；Three.js 单独 753 kB（gzip 193 kB），不进首屏主包。

## 可访问性

- 语义化章节标题、跳转到主要内容链接、全站可见焦点环。
- 方向键 / PageUp / PageDown 翻章，Home / End 回首页或跳到末章，`Ctrl / Cmd + J` 切主题；焦点在输入控件内时不拦截按键。
- 成员切换是标准 tablist：方向键、Home / End 切换，左右滑动是鼠标/触屏增强，不是唯一入口；缩略图本身可点击、可聚焦。
- WATCH INTRO 与移动菜单都使用原生 `<dialog>`，支持 Esc、点击遮罩关闭，打开时锁背景滚动。
- 状态不只靠颜色表达：阶段同时有形状、文案与颜色；在线状态带文字。
- 尊重 `prefers-reduced-motion`：启动层快速结束、打字机直接出全文、入场动画不位移、Three.js 不初始化并直接使用 2D 点阵字。
- 深色主题的正文与信号色都按对比度重新取值；浅色主题的章节文字使用深墨色，页眉保留深底白字。
- 主题开关不依赖过渡事件，减弱动效或动画被中断时仍能正确切换。

已用无头 Edge 在 1440 × 900 与 390 × 844 下逐章截图检查，并验证了锚点导航、主题切换（浅色 ⇄ 深色）、移动菜单、复制提示、WATCH INTRO 与键盘翻章；未做真实读屏软件与真机手势测试。

## 部署到 Netlify

### 方式一：连接 Git 仓库

1. 新建站点并选择仓库。
2. Build command 填 `pnpm build`，Publish directory 填 `dist`。
3. Node 版本已在 `netlify.toml` 固定为 22，pnpm 版本固定为 11。
4. 需要后端时在 Site settings → Environment variables 添加 `VITE_API_BASE_URL`，然后重新部署。

`netlify.toml` 已包含：

- SPA 回退到 `index.html`
- `/assets/*` 一年 immutable 缓存，`index.html` 每次校验
- `X-Content-Type-Options`、`X-Frame-Options`、`Referrer-Policy`、`Permissions-Policy`
- 未启用 CSP，等接入分析或第三方服务后按实际来源补

### 方式二：拖拽产物

```bash
pnpm build
```

把 `dist/` 拖进 Netlify Drop 即可。主视觉、分享图、favicon 都在 `public/`，会原样复制进产物。

绑定自定义域名后，建议把 `index.html` 里的 `og:image` 改成绝对地址（例如 `https://JDZone.top/og.jpg`），部分社交平台不解析相对路径。

## 已知边界

- 1:1 对齐的是首屏主视觉与导航骨架；其余章节沿用原站的档案式内容结构，只换了电影感皮肤与章节顺序。
- 远程内容接口只有前端契约与降级逻辑，示例后端未包含在仓库内。
- 没有单元测试与端到端测试；交互验收目前依赖手动脚本与截图。
- 主视觉来自用户提供的素材；替换 `public/images/hero-cinematic.jpg` 与 `public/og.jpg` 即可换图，注意同步 `HomeSection.vue` 的宽高与 OG 尺寸。
- Three.js 字标只出现在 WATCH INTRO：WebGL 失败、减弱动效或低端设备上回退到 2D 点阵字，不影响信息获取。
- 成员视觉板在没有正式图片前是设计化档案板；以后有头像/大图时按上面的字段接入，不会出现裂图。

## 联系

`hello@JDZone.top`
