# Turborepo 工作区与随笔

## Background

用户需要在博客随手记录日常，写作时只输入一个密码；随笔默认公开，可以编辑、隐藏、恢复公开和删除。用户指定 Turborepo、Bun 运行时的 NestJS、Drizzle 与 PostgreSQL，并确认 `/notes`、`/write` 的页面方案。`/write` 不出现在任何公开导航。

## Scope

- pnpm + Turborepo 工作区：`apps/blog` 保留 Next.js/Nextra 静态导出，`apps/api` 提供 Bun/NestJS 服务。
- Drizzle schema、版本化 SQL 迁移、PostgreSQL 持久化与本地 Compose。
- 公开随笔按时间倒序分页；密码管理入口支持新增、编辑、隐藏/恢复、二次确认删除、退出。
- 同源 `/api` 代理，生产容器、CI 和部署路径适配。

## Out of scope

注册、多用户、富文本、图片上传、全文检索、自动保存、离线写作、生产发布。

## Acceptance criteria

- 根目录统一启动、构建、检查；博客全部静态产物在 `apps/blog/out`。
- Bun 开发模式和编译后的生产模式都能启动 NestJS；数据库迁移可重复执行。
- 密码只保存 Argon2id 哈希；签名 HttpOnly Cookie 会话，写操作需要防跨站请求头，登录限流。
- 未登录不能读管理列表或修改；公开 API 始终过滤隐藏随笔。
- `/write` 无公开链接、sitemap 记录和索引内容；API 和写作页面不进入 Service Worker 缓存。
- 页面适配手机/电脑、明暗主题、键盘，具备加载、空态、错误、保存中和删除确认状态。
- 类型检查、构建、单元测试、真实 PostgreSQL 的 HTTP 集成测试及容器验证通过；外部环境限制如实记录。

## Feasibility

结论：可行。用户已指定运行栈并确认页面和交互，复用 ADR 0003 的静态博客容器与无 Registry 发布方式，不改变现有博客渲染架构。

- NestJS 的装饰器由 Bun 开发模式与 TypeScript 编译模式分别验证；构造器显式 `@Inject`，避免运行时元数据差异。
- Drizzle 使用稳定版与 postgres.js 驱动，连接池有界并在关闭时释放。迁移作为显式命令执行，不在每个进程启动时抢跑。
- 博客保持静态构建，随笔数据在浏览器通过同源 API 读取；数据库、密码和会话密钥不参与构建、不出现在前端包中。
- 隐藏通过数据库过滤实现，同时禁用 API、写作页缓存；既有 SW 已排除 `/api/`，本次再排除 `/write`。
- 迁移不覆盖历史发布、同意管理等其他任务；原 Hermes 交接保留到相关开发文档引用。

官方依据：[Turborepo tasks](https://turborepo.com/docs/crafting-your-repository/configuring-tasks)、[Drizzle PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)、[Bun decorator metadata](https://bun.sh/blog/release-notes/bun-v1.0.3)。

## Implementation

UI 已获用户确认：公开导航只添加“随笔”，`/notes` 为时间顺序阅读页；`/write` 为密码表单、正文编辑器和历史管理列表；退出回到密码表单。删除使用用户允许新增的 Radix AlertDialog。

已加载 `frontend-design`、`dammyjay93/interface-design` 与 `ibelick/baseline-ui`。沿用 Next.js 16.0.7、React 19.1.0、Tailwind 4.3.3，无现成业务组件库；复用 SiteShell、系统中文字体、mono 日期、paper/ink/muted/line/accent tokens。

工作简报：作者在一天结束时快速记下生活片段。正文输入框为写作焦点；公开页以日期侧注和保留换行的正文为主。领域词汇为随笔、片段、日期、公开、隐藏、留存。颜色取现有纸白、墨灰、灰线、灰字、青绿；只用边界分层，4px 基准，控件44px触摸区域。避免后台侧栏、数据统计卡片和富文本工具条。日期注记延续技术手账的身份。

生产存储使用独立 `blog-storage` Compose 项目，避免博客现有发布脚本的 `--remove-orphans` 删除 API 或数据库。原博客 CI 发布流程保留；API 镜像、密钥配置、显式迁移和首次启动按 [部署文档](../deployment.md) 执行。本次不连接生产数据库、不生成用户的正式密码、不部署。

## Verification

- `pnpm typecheck`、`pnpm check`、`pnpm build` 通过，博客静态导出及 RSS、llms、Pagefind、sitemap、SEO、Early Hints、SW 和预压缩产物完整。
- `pnpm test` 覆盖博客回归和 API 单元测试，包括 `/write` 无导航链接、无 sitemap 记录、noindex，以及 SW 不缓存写作页。
- `pnpm test:integration` 在真实 PostgreSQL 17.10 上通过：3 项测试、58 项断言，覆盖密码/会话、未授权访问、跨站请求限制、限流、公开/隐藏、编辑/删除、分页、重复迁移和重启后持久化。测试仅操作临时数据库中的自建记录。
- 根目录 `pnpm dev` 实际同时启动 Next.js 与 Bun/NestJS；编译后 `bun dist/main.js` 在生产配置下通过数据库 readiness、密码登录及 Secure/HttpOnly Cookie 检查。
- Chrome 实测桌面 1280px 和手机 390px，完整验证错误密码、公开/私密发布、公开列表排除隐藏内容、隐藏/恢复、编辑、删除取消/确认、退出、深色主题和无横向溢出；无页面异常。网络失败保留正文，重试保存成功；取消删除后焦点返回原按钮。
- pnpm 9 冻结锁文件安装、API 生产依赖打包及三份 Compose 配置校验通过。本机 Docker Desktop 引擎不可用，无法本地运行容器构建；CI 已增加 PostgreSQL 服务、API/博客镜像构建及运行检查，结果以 PR 最新检查为准。

## Review

完成仓库规范与验收逐项审阅。修复了历史列表首次加载与新建保存的竞争、删除弹窗关闭后的焦点、网络错误中文反馈。文章与媒体仅移动目录，保留既有博客交互与发布边界；密码和数据库信息仅在 API 运行环境读取。未发现遗留代码阻塞项，无需要建立路线图的已接受后续功能。

## Risks

- 公开内容一旦被访客读取，之后隐藏不能撤回其副本；系统保证之后的读取与缓存策略。
- 密码会话最长7天，轮换会话密钥可立即使旧会话失效；无多用户管理。
- 生产 PostgreSQL 需要持久卷与独立备份；数据库迁移不随应用镜像回滚自动撤销。
