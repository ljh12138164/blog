# 随笔密码入库与个人页更新

## Background
用户要求随笔密码改存 PostgreSQL，使用已提供的新密码，并补充最近合入的开源 PR、改写首页标题、为线上博客 API 添加 Uptime Kuma 监控。

## Scope
单作者密码继续使用 Argon2id，仅哈希入库。提供初始化、改密命令；旧环境哈希仅用于显式迁移。改密后旧密码和旧会话立即失效，无需重启 API。/about 沿用贡献卡片增加 RSSHub #23590，首页仅改标题。独立执行已授权的后端监控配置。

## Out of scope
多用户、注册、邮件、改密页面、生产应用发布。真实密码与哈希不进入仓库。

## Acceptance criteria
数据库改密即时生效；重复迁移不覆盖凭据；空凭据拒绝登录；旧会话改密后失效；现有随笔功能可用。新增贡献在静态 /about 可见，首页保留文章布局。

## Feasibility
可行。沿用 Bun、NestJS、Drizzle、PostgreSQL，无新增运行时依赖。复用现有迁移与单作者设计。按 owner 主键读取凭据，不缓存；会话签名绑定当前密码哈希。首次迁移导入旧哈希时冲突不覆盖。

## Implementation
从 origin/master 创建 feat/journal-db-password；用户要求在原目录开发后，所有改动已迁回 C:/Users/PC/Desktop/front/TEST/blog。原有 Dockerfile、deploy/server/deploy-blog 和 public/ 不属于本任务，保留且不提交。UI 复用当前布局，仅新增贡献内容与改写标题，无新页面、样式或组件库。数据库读取失败时拒绝认证，不回退环境密码。改密命令接受 10 到 1024 位密码，以支持本次用户指定的密码；不记录真实值。

RSSHub #23590 经 GitHub API 核实作者为 ljh12138164，2026-10-29 合入，新增 /cloudflare/blog 全文订阅。保留原有 DeepSeek PR 卡片，React key 改为 PR URL 避免同仓库多个条目冲突。

已通过 Uptime Kuma Socket API 创建监控 ID 15，名称“博客后端 · API 与数据库”，间隔 60 秒、重试间隔 60 秒、失败重试 2 次、请求超时 20 秒。公网探测超时后改为 http://blog-storage-api-1:3001/api/readyz；在服务器的 Uptime Compose 持久声明外部 blog-storage_default 网络，并热连接现有容器，没有重启服务。最新心跳 200 OK。该监控同时检查 API 和 PostgreSQL，就绪检查不依赖写作登录。

## Verification
- pnpm test:unit：API 6 项、博客 27 项全部通过。
- pnpm test:integration：本地隔离 PostgreSQL 18.4 的 4 项 HTTP 集成测试、65 项断言通过，包括重复迁移不覆盖密码、改密撤销旧会话、重启持久化、凭据缺失拒绝访问及原有随笔生命周期。
- pnpm typecheck、pnpm build 通过；首页、Pagefind、sitemap、robots 导出存在。
- 静态个人页回归 4 项通过，含新 PR 链接与首页文案。
- 根 Compose 与 API Compose 配置校验通过。Docker Desktop 引擎未运行，无法本地启动容器验证；CI 保持 PostgreSQL 17 与 API 镜像迁移、运行检查。
- Biome 与 git diff --check 通过。实际密码生成的 Argon2id 哈希已在仓库外验证，不进入补丁。

## Review
已对照仓库规范与验收项完成审阅：异步鉴权必须 await；迁移导入冲突不覆盖；CI 只在初始化进程传旧环境哈希；会话签名绑定数据库凭据；同仓库贡献 key 保持唯一。上述问题均已处理，无阻塞项。没有需要单独排期的已接受后续项，不创建空路线图。

## Risks
生产迁移与镜像发布需另行执行；新哈希留在仓库外供部署使用。
