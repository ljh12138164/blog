# 项目架构与术语

- 单仓库使用 pnpm workspaces 与 Turborepo。根目录管理任务、锁文件、代码检查与部署，应用各自持有运行依赖。
- `apps/blog`：Next.js App Router、Nextra 4 Custom Theme、Tailwind。技术文章为 `app/posts/<slug>/page.mdx`，摘要索引为 `lib/posts.ts`；站点域名在应用内 `site.config.json`。静态产物为 `apps/blog/out`。
- `apps/api`：Bun 运行 NestJS，Drizzle + postgres.js 连接 PostgreSQL。schema 和迁移由应用持有，尚无需要独立共享的包。
- 随笔是数据库中的短篇纯文本，与 MDX 技术文章分开。默认公开；隐藏后仅密码登录的作者能读取，删除为永久删除。
- `/notes` 是公开随笔列表。`/write` 是无公开链接的密码写作页，后端权限校验决定是否可读写；地址隐藏不承担鉴权职责。
- `/api` 是同源后端路径。开发由 Next.js 代理，生产由宿主 Nginx 代理；动态内容与写作页不缓存。
- 单作者写作密码的 Argon2id 哈希存于 PostgreSQL 的 `journal_credentials` 表（`id=owner`）；API 即时读取，密码修改使旧会话失效。`SESSION_SECRET` 仍由环境提供。
- 博客和 API 分别构建镜像；博客延续现有发布包部署，API 与 PostgreSQL 使用独立 Compose 项目及持久卷。
