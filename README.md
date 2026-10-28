# 个人博客

一个使用 pnpm workspaces 与 Turborepo 管理的个人博客与随笔单仓库。`apps/blog` 使用 Next.js、Nextra 4、Tailwind CSS，继续静态导出；`apps/api` 使用 Bun、NestJS、Drizzle 与 PostgreSQL 存储随笔。应用各自管理依赖，根目录统一执行任务。

```text
apps/blog/       博客、公开随笔页、密码写作页、静态构建脚本
apps/api/        NestJS API、Drizzle schema 与 SQL 迁移
deploy/          Nginx 与现有博客发布脚本
```

`/about`（关于我）承接原 `self.ljhboard.cn/` 的完整个人主页：资料、作品预览、工具直达、开源贡献与技术栈；博客首页保持文章布局。来源和功能对照见 [个人站迁移清单](docs/self-site-migration.md)。构建后可运行 `pnpm --filter @blog/web exec vitest run scripts/personal-hub.test.mjs` 核验迁移产物及本地静态资源。

## 本地运行

```bash
pnpm install --frozen-lockfile
docker compose -f compose.dev.yaml up -d --wait
pnpm auth:setup
pnpm db:migrate
pnpm dev
```

需要 Node.js 22+、pnpm 9.12.3、Bun 1.4.4 和 PostgreSQL 17。`pnpm auth:setup` 提示设置写作密码，并生成未跟踪的 `apps/api/.env`（密码只存 Argon2id 哈希）。已有 PostgreSQL 时可跳过 Compose，修改 `.env` 中的 `DATABASE_URL` 后迁移即可。

博客运行于 `http://localhost:3000`，API 默认监听 `127.0.0.1:3001`，开发环境 `/api` 自动代理到 API。只启动一端可用 `pnpm dev:blog` 或 `pnpm dev:api`。

## 随笔

公开入口为 `/notes`，按时间倒序展示，每次加载20篇。写作入口为 `/write`，只通过收藏地址访问，不出现在导航、页脚、站点地图或全文搜索中。输入密码即可写作和管理，无需注册账号。

新随笔默认公开，可勾选“仅自己可见”。历史随笔支持编辑、隐藏、恢复公开、二次确认删除和退出。隐藏正文只由鉴权后的管理 API 返回，API 响应不缓存，正文按纯文本展示。密码验证签发最长7天的 HttpOnly 会话。

轮换密码时更新 `apps/api/.env` 的密码哈希与随机 `SESSION_SECRET`，重启 API，旧会话随之失效。生产环境须使用 HTTPS 与 `COOKIE_SECURE=true`，并独立备份数据库卷。

API 路由：`GET /api/notes`（公开）、`POST /api/auth/login`、`GET /api/auth/session`、`POST /api/auth/logout`，以及鉴权的 `GET/POST /api/admin/notes`、`PATCH/DELETE /api/admin/notes/:id`。写请求需要 `X-Journal-Request: 1`，登录每 IP 每分钟最多5次。

## 构建与搜索索引

```bash
pnpm test:early-hints
pnpm test:indexnow-submit
pnpm test:theme
pnpm build
pnpm test:resource-hints
```

博客测试基于 Vitest，API 测试基于 Bun，可直接使用 `pnpm test:unit` 执行全部构建前单元测试，或使用 `pnpm test` 执行全部测试。`pnpm test:theme` 验证明暗主题解析与偏好回退；`pnpm test:early-hints` 验证静态页面到 Nginx `Link` 响应头映射的生成规则；`pnpm test:indexnow-submit` 使用本地 HTTP 服务验证 sitemap 过滤与 IndexNow JSON 协议，不访问真实接口。`pnpm build` 生成 `apps/blog/out/` 静态站点及 SEO 产物，随后 `pnpm test:resource-hints` 验证实际导出页面只保留 DNS-prefetch，CSS 继续通过 Early Hints preload。

## 代码检查与提交钩子

```bash
pnpm check
pnpm check:write
```

`pnpm check` 执行全仓 lint；`pnpm check:write` 适合主动统一全仓格式。`pnpm install` 会通过 simple-git-hooks 安装 `pre-commit` 钩子，提交时 lint-staged 仅将暂存的 JavaScript、TypeScript、JSON 和 CSS 文件交给 Biome 检查并安全修复。

## 文章发现与阅读

- `/posts` 支持分类筛选和 Pagefind 全文搜索；`q` 与 `category` 查询参数可分享，搜索需要先完成生产构建。
- `/series` 提供系列入口，`/series/<slug>` 按策划顺序展示文章。系列配置位于 `apps/blog/lib/post-discovery.ts` 的 `series`，每个 slug 必须指向已有 MDX 文章；新增普通文章无需加入系列。
- 文章页自动生成同系列上下篇及最多三篇相关推荐（同系列优先，其次同分类）。目录支持手机、平板与桌面，正文图片复用 Nextra ImageZoom。

## SEO 配置

规范地址 `https://ljhboard.cn` 统一配置在 `apps/blog/site.config.json`，`blog.ljhboard.cn` 保留直接访问，不配置跨域 301。两端服务同一静态产物和 sitemap；规范地址用于 canonical、Open Graph、JSON-LD、`sitemap.xml`、`robots.txt` 与 LLM 索引。不要使用源站 IP 构建生产静态文件。`postbuild` 会检查每个 HTML 只能包含一个属于规范域名的 canonical，并检查 head 中唯一的 AdSense 账号验证 meta。AdSense 脚本由 Next Script 在 hydration 后加载，避免抢先修改 head；同步默认同意仍在 head 中建立。双域名 sitemap 验收见[部署文档](docs/deployment.md)。

- **社交分享卡片**：全站默认与文章均配置 1200x630 标准 Open Graph / Twitter 预览图（`og-image.png`），支持 Twitter Summary Large Image 卡片。
- **结构化数据**：首页提供 `WebSite`（含 Sitelinks Searchbox）、`Organization` 与 `Person` 实体；文章页提供 `TechArticle` / `BlogPosting` 与分级 `BreadcrumbList`。
- **爬虫与地图分级**：`next-sitemap` 按页面重要度分配权重梯度（首页 1.0、索引页 0.9、文章 0.8、关于 0.6、隐私 0.3），并在 `robots.txt` 中显式允许主流 AI 搜索爬虫（GPTBot、ClaudeBot、PerplexityBot 等）。
- **AI 检索与 GEO**：`llms.txt` 与 `llms-full.txt` 遵循大模型权威出处与引用标准，提供作者资历与全量 Markdown 正文索引。

新增文章时，需要同时：

1. 在 `apps/blog/app/posts/<slug>/page.mdx` 新建文章，并导出完整元数据（包含 title、description、date、category、readingTime、alternates、openGraph、twitter）。
2. 在 `apps/blog/lib/posts.ts` 添加文章摘要，供首页文章列表读取。

## 自动部署

Pull Request 会验证站点并构建、启动临时 Docker 镜像，检查 HTML 的 Early Hints `Link` 响应头以及静态资源和健康检查的隔离。推送到 `master` 后，GitHub Actions 会构建不可变 `blog:sha-<commit>` Docker 镜像，并将镜像和仓库中的 Compose、Nginx、部署配置通过受限 SSH 发送到服务器。服务器只导入并运行本地镜像，不构建站点、不访问 GHCR 或 GitHub Packages。公网验证和 IndexNow 根密钥验证通过后，流水线读取线上 sitemap 并通知 IndexNow。

完整的首次服务器引导、变量、回滚和排障说明见 [部署文档](docs/deployment.md)。

## 项目维护 Skill

项目级 Skill 位于 `.agents/skills/maintain-blog`，规定文章元数据同步、文档维护、构建验证和 `HERMES.md` 中断续接流程。

## 数据库与 API 验证

`pnpm db:generate` 根据 schema 生成版本化 SQL，审阅后使用 `pnpm db:migrate` 执行。迁移不在服务启动时自动执行。

博客使用 Vitest，API 使用 Bun。`pnpm test:unit` 检查两端；`pnpm test` 先构建再执行全部不依赖数据库的测试。HTTP 集成测试需独立的数据库，名称以 `_test` 结尾：设置 `TEST_DATABASE_URL` 后运行 `pnpm test:integration`，测试会迁移该数据库并验证登录、显隐、编辑、删除和重启持久化。不能指向生产数据库。
