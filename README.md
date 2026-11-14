# JDZone · Joint Discovery Zone

三个人组成的软件工程小组介绍站。视觉与文案以单文件参考稿为基准，代码按可维护的 Vue 工程重写：六个满屏章节、朱红强调色、等宽章节索引、档案式成员页、可跳过的启动层，以及首屏的 Three.js 点云字标。

当前是**纯静态站点**，构建产物可直接部署到 Netlify、Cloudflare Pages 或任意静态托管；内容读取收敛在服务层，后续接 API 时页面组件不用改。

## 技术栈

| 层 | 选择 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` + TypeScript） |
| 构建 | Vite 7 |
| 样式 | Tailwind CSS 4（`@theme inline` + CSS 变量） |
| 三维 | Three.js 0.187（首屏点云字标，独立懒加载 chunk） |
| 图标 | `@phosphor-icons/vue` |
| 字体 | `@fontsource/oswald`、`@fontsource/jetbrains-mono`（本地托管，只打包 Latin 子集） |
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

- **参考稿优先**：保留首页 Joint Discovery / Zone 点阵字、关于页「+」列表、成员档案 + 缩略图、五阶段项目路线图、虚线日志、打字机联系页与状态栏。
- **三维字标**：首屏右侧的 JDZone 由约两万个粒子组成；启动层退场后，18 段代码碎片（移动端 10 段）从画面四边飞入，与点云一起收拢成字，停稳后留下极轻的漂移。一条轨道线与三个操作员节点环绕文字，对应「三个人、一种协作方式」。指针位置通过射线反投影到字面局部平面，排斥中心与光标严格对齐，不再使用经验系数。Three.js 独立懒加载，字体就绪后开始准备；加载期间、减弱动效或 WebGL 不可用时自动落回 2D 点阵字，不影响首屏可用性。
- **字体分工**：标题和正文用系统无衬线字体，字重 800；章节编号与英文标签用等宽字体；Oswald 只用于启动百分比、成员英文名、缩略图编号等展示位。
- **一套形状规则**：直角为主，只在右下角切角，尺寸收敛到 6 / 10 / 16 三档。
- **两种强调色各司其职**：朱红负责品牌与主要动作；青色只做在线/信号提示。浅色主题下青色文字改用更深的 `--signal-ink`，保证可读性。
- **主题切换**：`data-theme` 驱动 CSS 变量；首屏内联脚本在样式加载前恢复主题，避免闪白。切换时先铺一层目标主题底色，用 WAAPI 从按钮位置圆形扩散；同时叠加一层独立的 HUD（48px 网格、扫描线、描边环、准星、模式标签）。动画完成或 1100ms 兜底后原子提交主题，不依赖 `transitionend`。
- **相对参考稿修复的问题**：启动层可跳过并尊重减弱动效；移除全局 `user-select: none` 与 `overflow: hidden`；把空人物占位框改为有信息的档案板；修复青色文字对比度；补齐焦点样式、键盘操作、移动端导航、页面元信息与分享图；成员切换不再只能鼠标拖拽。
- **动效**：章节入场使用 0.9s 的位移 + 模糊 + 缩放复合过渡，并按阅读顺序错峰；按钮有切角内描边、悬停上浮、硬阴影与指针位置水波；成员档案板有扫描线、浮动首字母和信号刻度；页面入场、成员切换、主题揭示都尊重 `prefers-reduced-motion`。

## 目录结构

```text
src/
├─ App.vue                    # 应用外壳：滚动容器、章节导航、键盘、hash、启动层
├─ main.ts                    # 字体、样式、内容加载与挂载
├─ assets/styles/main.css     # 设计令牌、工具类、按钮、主题揭示与减弱动效分支
├─ types/site.ts              # 全站内容类型契约 SiteContent
├─ data/                      # 静态内容（成员、项目、日志、联系方式…）
├─ services/content.ts        # 内容读取入口：静态优先，可切到远程 API
├─ composables/               # 主题、启动、章节导航、复制、提示、滑动手势…
├─ directives/reveal.ts       # v-reveal 入场指令
└─ components/
   ├─ layout/                 # 页眉、侧边导轨、底部状态栏、移动菜单、懒加载外壳、启动层
   ├─ sections/               # 首页、关于、项目进展、开发日志、联系
   ├─ members/                # 成员档案（标签页 + 滑动切换）与档案板
   ├─ background/             # 粒子场、点阵字、Three.js 点云字标
   └─ ui/                     # 按钮、章节标题、印章、主题开关、Toast、骨架屏…
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

- **首屏最小化**：首页同步打包，其余五章由 `LazySection` 在距离视口 1200px 时动态 `import()`，加载中显示同尺寸骨架屏；首屏空闲后再预取全部章节，避免滚动时插入骨架造成吸附跳动。
- **字体本地化 + 子集化**：只引入 Oswald 500/700 与 JetBrains Mono 400/500 的 Latin 子集，构建后共 8 个字体文件，不请求第三方字体服务。
- **拆分稳定依赖**：Vite `manualChunks` 把 Vue、图标、Three.js、其余 vendor 分开，业务代码更新时缓存不失效。
- **Three.js 按需加载**：`three` 是独立 chunk（约 753 kB / gzip 193 kB），字体就绪后动态 `import()`，组装等到启动层退场；页面隐藏时暂停渲染，移动端把采样步长从 2 提到 3（约 9 千点、10 段代码），桌面约 2 万点、18 段代码。代码碎片只在外缘取样，中心留白保证字可读。
- **装饰性 Canvas 降级**：粒子与点阵字按设备像素比封顶 1.5，页面隐藏时暂停；`prefers-reduced-motion` 下不启动动画，三维字标直接使用 2D 点阵字；WebGL 创建失败也会回退，不阻塞内容。
- **主题不闪白**：`index.html` 内联脚本在首屏绘制前写 `data-theme` 与 `color-scheme`。
- **入场动画**：`v-reveal` 用 IntersectionObserver，只触发一次；无 JS 时内容直接可见。
- **主题切换无阻塞**：遮罩层动画不等待 CSS 过渡事件，动画完成、失败或超时都会提交状态；减弱动效时改为 220ms 旧底色淡出。
- 当前生产包约：入口 JS 57 kB（gzip 22 kB）、Vue 78 kB（gzip 31 kB）、图标 15 kB（gzip 4 kB）、CSS 49 kB（gzip 11 kB），五个懒加载章节各 1.4 至 9.7 kB；Three.js 单独 753 kB（gzip 193 kB），不进首屏主包。

## 可访问性

- 语义化章节标题、跳转到主要内容链接、全站可见焦点环。
- 上下方向键 / PageUp / PageDown 翻章，Home / End 回首页或跳到末章，`Ctrl / Cmd + J` 切主题；焦点在输入控件内时不拦截按键。
- 成员切换是标准 tablist：方向键、Home / End 切换，左右滑动是鼠标/触屏增强，不是唯一入口；缩略图本身可点击、可聚焦。
- 移动菜单使用原生 `<dialog>`，打开时锁背景滚动，支持 Esc 与点击遮罩关闭。
- 状态不只靠颜色表达：阶段同时有形状、文案与颜色；在线状态带文字。
- 尊重 `prefers-reduced-motion`：启动层快速结束、打字机直接出全文、入场动画不位移、三维字标不初始化并直接使用 2D 点阵字。
- 深色主题的正文与信号色都按对比度重新取值，没有直接复用青色 `#19D1FF` 作为浅底文字。
- 主题开关不依赖过渡事件，减弱动效或动画被中断时仍能正确切换。

已用无头 Edge 在 1440×900 与 390×844 下逐章截图检查，并验证了锚点导航、主题切换（浅色 ⇄ 深色）、移动菜单、复制提示与键盘翻章；未做真实读屏软件与真机手势测试。

## 部署到 Netlify

### 方式一：连接 Git 仓库

1. 新建站点并选择仓库。
2. Build command 填 `pnpm build`，Publish directory 填 `dist`。
3. Node 版本已在 `netlify.toml` 固定为 22。
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

把 `dist/` 拖进 Netlify Drop 即可。预览图、favicon 都在 `public/`，会原样复制进产物。

绑定自定义域名后，建议把 `index.html` 里的 `og:image` 改成绝对地址（例如 `https://JDZone.top/og.png`），部分社交平台不解析相对路径。

## 已知边界

- 远程内容接口只有前端契约与降级逻辑，示例后端未包含在仓库内。
- 没有单元测试与端到端测试；交互验收目前依赖手动脚本与截图。
- Three.js 字标是装饰层：WebGL 失败、减弱动效或低端设备上都回退到 2D 点阵字；三维交互（指针排斥、缓慢轨道）是增强项，不影响信息获取。
- 成员视觉板是设计化的档案板，不是人物照片；以后有正式肖像时替换 `MemberVisual.vue` 即可。

## 联系

`hello@JDZone.top`
