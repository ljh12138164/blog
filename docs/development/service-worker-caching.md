# Workbox Service Worker 离线与静态资源缓存

## Background

博客基于 Next.js 16 App Router 与 Nextra 4 构建，采用 `output: 'export'` 纯静态输出模式。为提升弱网与离线环境下的文章可读性，读者离线重访时需要 Service Worker 提供缓存支持；同时需确保在线时优先拉取最新博文，哈希静态资源高效持久缓存，且第三方动态请求不被污染。

## Scope

1. 引入 `workbox-build`，编写 `scripts/generate-sw.mjs` 构建脚本并集成至 `package.json` 的 `postbuild` 流水线。
2. 配置精确的 Service Worker 运行时缓存路由策略：
   - **页面文档（HTML 导航路由）**：采用 `NetworkFirst`（网络超时 3 秒回退至本地缓存），保证博文更新及时生效与离线可读。
   - **构建哈希资源（`/_next/static/*`）**：采用 `CacheFirst`（最长 1 年，容量上限 500 项），充分利用 content-hash 零冲突特性。
   - **静态公共媒体与图标**：采用 `StaleWhileRevalidate` 兼顾即时展示与后台静默更新。
   - **第三方与动态请求（Giscus 评论、百度统计、Google 统计等）**：强制采用 `NetworkOnly` 或忽略，避免跨域与动态状态污染本地缓存。
3. 内联 Workbox Runtime（`inlineWorkboxRuntime: true`），完全摆脱对 Google CDN（`storage.googleapis.com`）的外部网络依赖，保障中国内地网络稳定。
4. 在生产环境的客户端页面注入 Service Worker 注册逻辑（开发环境禁用以防干扰 HMR）。
5. 编写单元与集成测试（`scripts/generate-sw.test.mjs`），确保构建脚本配置与产物策略符合预期。

## Out of scope

1. 完整的 PWA 桌面安装交互弹窗与离线后台同步（Background Sync）。
2. 文章增量更新推送（Web Push Notifications）。

## Acceptance criteria

1. 执行 `pnpm build` 时，`scripts/generate-sw.mjs` 正常执行，在 `out/sw.js` 生成自包含的 Service Worker 文件。
2. 生成的 Service Worker 文件内联了 Workbox runtime，无对 `storage.googleapis.com` 的请求。
3. 导航请求匹配 `NetworkFirst` 策略（超时 3 秒）。
4. `/_next/static/*` 匹配 `CacheFirst` 策略。
5. Giscus、百度统计等第三方及跨域请求路由到 `NetworkOnly`，不进入静态持久缓存。
6. 生产环境构建后，HTML 中包含 Service Worker 注册脚本，且在 `navigator.serviceWorker` 可用时注册 `/sw.js`。
7. `scripts/generate-sw.test.mjs`、`pnpm typecheck`、`pnpm check` 与全套单元测试通过。

## Feasibility

- 构建体系：现有 `postbuild` 脚本流水线已串联 RSS、LLMs、Pagefind、Sitemap、Early Hints 和 Precompress。`generate-sw.mjs` 可以作为其中独立一步，置于 `precompress.mjs` 之前，使得生成的 `sw.js` 也能获得 Gzip 预压缩收益。
- 兼容性：`workbox-build` 7.4.x 支持 Node 18+ 与 ES 模块，通过 `inlineWorkboxRuntime: true` 生成独立产物，避开与 Turbopack 打包插件耦合的风险。

## Implementation decisions

- 产物路径：`swDest: 'out/sw.js'`，同时复制至 `public/sw.js` 方便开发与预览调试。
- 注册逻辑：在 `app/layout.tsx` 中条件化载入注册代码（仅在生产构建时激活）。
- 策略顺序：
  1. 外部/第三方域名（跨域或含 giscus/baidu 等） -> `NetworkOnly`
  2. 导航请求（HTML） -> `NetworkFirst`（超时 3s，缓存容量 50）
  3. `/_next/static/*` -> `CacheFirst`（缓存 1 年，容量 500）
  4. 本地静态资源（图片/字体/搜索索引） -> `StaleWhileRevalidate`

## Risks

- 需防止预缓存（precaching）意外缓存了旧版 HTML 导致文章不更新。因此 precache 仅纳入基础必须文件或留空，所有导航走 `NetworkFirst` 运行时缓存。
