# Turborepo 工作区与随笔

## Background

用户需要在博客随手记录日常，写作时只输入一个密码；随笔默认公开，可以编辑、隐藏、恢复公开和删除。用户指定 Turborepo、Bun 运行时的 NestJS、Drizzle 与 PostgreSQL，并确认 `/notes`、`/write` 的页面方案。`/write` 不出现在任何公开导航。

## Scope

- pnpm + Turborepo 工作区：`apps/blog` 保留 Next.js/Nextra 静态导出，`apps/api` 提供 Bun/NestJS 服务。
- Drizzle schema、版本化 SQL 迁移、PostgreSQL 持久化与本地 Compose。
- 公开随笔按时间倒序分页；密码管理入口支持新增、编辑、隐藏/恢复、二次确认删除、退出。
- 同源 `/api` 代理，生产容器、CI 和部署路径适配。

## Out of scope

注册、多用户、富文本、图片上传、全文检索、自动保存、离线写作。

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

生产存储使用独立 `blog-storage` Compose 项目，避免博客现有发布脚本的 `--remove-orphans` 删除 API 或数据库。原博客 CI 发布流程保留；API 镜像、密钥配置、显式迁移和首次启动按 [部署文档](../deployment.md) 执行。

用户随后明确授权通过 Workbench 从本地发布，绕过受账号额度限制的 Actions，并要求服务器不执行高负载任务。构建、测试和压缩全部在本地，服务器只加载镜像、迁移和运行服务。现场核对发现 `18081` 属于 Token Paper，改用空闲 `18088`；API 限制 0.5 CPU/256 MiB，PostgreSQL 限制 0.5 CPU/192 MiB、32 MiB shared_buffers、20 个连接。博客 Nginx 与现场已运行的 `1.30.6-alpine` 对齐，避免降级。保留服务器现有镜像保留钩子及其他应用。

## Verification

- `pnpm typecheck`、`pnpm check`、`pnpm build` 通过，博客静态导出及 RSS、llms、Pagefind、sitemap、SEO、Early Hints、SW 和预压缩产物完整。
- `pnpm test` 覆盖博客回归和 API 单元测试，包括 `/write` 无导航链接、无 sitemap 记录、noindex，以及 SW 不缓存写作页。
- `pnpm test:integration` 在真实 PostgreSQL 17.10 上通过：3 项测试、58 项断言，覆盖密码/会话、未授权访问、跨站请求限制、限流、公开/隐藏、编辑/删除、分页、重复迁移和重启后持久化。测试仅操作临时数据库中的自建记录。
- 根目录 `pnpm dev` 实际同时启动 Next.js 与 Bun/NestJS；编译后 `bun dist/main.js` 在生产配置下通过数据库 readiness、密码登录及 Secure/HttpOnly Cookie 检查。
- Chrome 实测桌面 1280px 和手机 390px，完整验证错误密码、公开/私密发布、公开列表排除隐藏内容、隐藏/恢复、编辑、删除取消/确认、退出、深色主题和无横向溢出；无页面异常。网络失败保留正文，重试保存成功；取消删除后焦点返回原按钮。
- pnpm 9 冻结锁文件安装、API 生产依赖打包及三份 Compose 配置校验通过。用户重启 Docker 后，`apps/api/Dockerfile` 完整构建成功，Linux 容器确认 Bun 1.4.4。博客再次通过本机 `pnpm build`，将同次静态产物、Early Hints 映射和仓库 Nginx 配置打包到 `nginx:1.30.6-alpine`；根 Dockerfile 的重复依赖下载受代理影响而取消，不能将产物打包等同于该多阶段 builder 已通过。
- 本地使用生产资源限制启动 PostgreSQL/API 和临时博客容器，显式迁移及 HTTP 检查通过：静态页面、canonical、Early Hints、历史路径跳转、隐藏入口、sitemap、readiness、未授权401、密码错误、Secure/HttpOnly Cookie、隐藏记录新增/编辑/删除、公开过滤、退出。验收后只移除本次本地临时容器与测试卷。
- 2026-10-28 21:55 CST，经用户授权使用 Workbench 发布 `blog:sha-ab9cb32b1897325a69cc077eae656a6240674b27`、`blog-api:sha-ab9cb32b1897325a69cc077eae656a6240674b27` 与 PostgreSQL 17。服务器未执行依赖安装、构建、测试套件或压缩；只加载本地镜像、显式迁移、启动独立存储栈和切换博客，Nginx 校验后平滑重载。配置快照位于 `/opt/stacks/blog/backups/sha-ab9cb32b1897325a69cc077eae656a6240674b27-workbench-20261028T135504Z`；旧博客镜像与现场镜像保留钩子保留，其他容器保持运行。
- 线上三项服务 healthy；验收取样 API约45 MiB、PostgreSQL约28 MiB，CPU分别约0.03%/0.01%。资源上限实际生效，数据库未暴露宿主端口，API只绑定127.0.0.1:18088。服务器密钥文件权限600；写作密码仅在本机忽略文件 `.secrets/journal-production-password.txt`，没有进入提交或日志。
- 根域名通过公网完整 HTTP 验收，生产手机 Chrome 实测密码登录、编辑器、退出与公开列表，无横向溢出或页面异常；公网验证只创建隐藏记录并在结束前删除。两域名均保留原页面/API入口与根域名 canonical。blog 默认解析节点172.67.66.3在当前网络连接超时；改用 Cloudflare 节点104.21.3.160、保持原 Host/SNI并校验证书后，首页、关于页、文章、随笔、写作页、同一 sitemap、robots、API就绪200与管理401均通过。没有修改 DNS、重定向或 Cloudflare 规则，默认解析网络限制单独保留。
- PR [#32](https://github.com/ljh12138164/blog/pull/32) 保持开放。CI [#125](https://github.com/ljh12138164/blog/actions/runs/40685459283) 未启动 verify，检查注释明确提示 GitHub 账号付款失败或需要提高支出额度，没有运行代码步骤。标准博客 Docker builder 与 CI 仍待网络/账号环境恢复后补验，不宣称 Actions 通过。

## Review

完成仓库规范与验收逐项审阅。修复了历史列表首次加载与新建保存的竞争、删除弹窗关闭后的焦点、网络错误中文反馈。文章与媒体仅移动目录，保留既有博客交互与发布边界；密码和数据库信息仅在 API 运行环境读取。未发现遗留代码阻塞项；本地运行容器及生产验收通过，标准博客 Docker builder/Actions 和默认解析网络限制如上记录。无需要建立路线图的已接受后续功能。

## Risks

- 公开内容一旦被访客读取，之后隐藏不能撤回其副本；系统保证之后的读取与缓存策略。
- 密码会话最长7天，轮换会话密钥可立即使旧会话失效；无多用户管理。
- 生产 PostgreSQL 需要持久卷与独立备份；数据库迁移不随应用镜像回滚自动撤销。
