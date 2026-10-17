# 个人博客

一个使用 Nextra 4 Custom Theme、Next.js、Tailwind CSS、Turbopack 和 pnpm 构建的中文个人博客。生产站点是静态导出内容，封装于项目管理的 Docker 镜像中。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建与搜索索引

```bash
pnpm test:early-hints
pnpm test:indexnow-submit
pnpm test:theme
pnpm build
pnpm test:resource-hints
```

测试基于 Vitest 运行，亦可直接使用 `pnpm test:unit` 执行全部构建前单元测试，或使用 `pnpm test` 执行全部测试。`pnpm test:theme` 验证明暗主题解析与偏好回退；`pnpm test:early-hints` 验证静态页面到 Nginx `Link` 响应头映射的生成规则；`pnpm test:indexnow-submit` 使用本地 HTTP 服务验证 sitemap 过滤与 IndexNow JSON 协议，不访问真实接口。`pnpm build` 生成 `out/` 静态站点及 SEO 产物，随后 `pnpm test:resource-hints` 验证实际导出页面只保留 DNS-prefetch，CSS 继续通过 Early Hints preload。

## 代码检查与提交钩子

```bash
pnpm check
pnpm check:write
```

`pnpm check` 执行全仓 lint；`pnpm check:write` 适合主动统一全仓格式。`pnpm install` 会通过 simple-git-hooks 安装 `pre-commit` 钩子，提交时 lint-staged 仅将暂存的 JavaScript、TypeScript、JSON 和 CSS 文件交给 Biome 检查并安全修复。

## 文章发现与阅读

- `/posts` 支持分类筛选和 Pagefind 全文搜索；`q` 与 `category` 查询参数可分享，搜索需要先完成生产构建。
- `/series` 提供系列入口，`/series/<slug>` 按策划顺序展示文章。系列配置位于 `lib/post-discovery.ts` 的 `series`，每个 slug 必须指向已有 MDX 文章；新增普通文章无需加入系列。
- 文章页自动生成同系列上下篇及最多三篇相关推荐（同系列优先，其次同分类）。目录支持手机、平板与桌面，正文图片复用 Nextra ImageZoom。

## SEO 配置

正式站点 `https://ljhboard.cn` 统一配置在 `site.config.json`。该值用于 canonical、Open Graph、JSON-LD、`sitemap.xml`、`robots.txt` 与 LLM 索引；不要使用源站 IP 构建生产静态文件。`postbuild` 会检查每个 HTML 只能包含一个属于正式域名的 canonical，并检查 head 中唯一的标准 async AdSense 脚本及其 Rocket Loader 排除属性。域名切换顺序见[部署文档](docs/deployment.md)。

- **社交分享卡片**：全站默认与文章均配置 1200x630 标准 Open Graph / Twitter 预览图（`og-image.png`），支持 Twitter Summary Large Image 卡片。
- **结构化数据**：首页提供 `WebSite`（含 Sitelinks Searchbox）、`Organization` 与 `Person` 实体；文章页提供 `TechArticle` / `BlogPosting` 与分级 `BreadcrumbList`。
- **爬虫与地图分级**：`next-sitemap` 按页面重要度分配权重梯度（首页 1.0、索引页 0.9、文章 0.8、关于 0.6、隐私 0.3），并在 `robots.txt` 中显式允许主流 AI 搜索爬虫（GPTBot、ClaudeBot、PerplexityBot 等）。
- **AI 检索与 GEO**：`llms.txt` 与 `llms-full.txt` 遵循大模型权威出处与引用标准，提供作者资历与全量 Markdown 正文索引。

新增文章时，需要同时：

1. 在 `app/posts/<slug>/page.mdx` 新建文章，并导出完整元数据（包含 title、description、date、category、readingTime、alternates、openGraph、twitter）。
2. 在 `lib/posts.ts` 添加文章摘要，供首页文章列表读取。

## 自动部署

Pull Request 会验证站点并构建、启动临时 Docker 镜像，检查 HTML 的 Early Hints `Link` 响应头以及静态资源和健康检查的隔离。推送到 `master` 后，GitHub Actions 会构建不可变 `blog:sha-<commit>` Docker 镜像，并将镜像和仓库中的 Compose、Nginx、部署配置通过受限 SSH 发送到服务器。服务器只导入并运行本地镜像，不构建站点、不访问 GHCR 或 GitHub Packages。公网验证和 IndexNow 根密钥验证通过后，流水线读取线上 sitemap 并通知 IndexNow。

完整的首次服务器引导、变量、回滚和排障说明见 [部署文档](docs/deployment.md)。

## 项目维护 Skill

项目级 Skill 位于 `.agents/skills/maintain-blog`，规定文章元数据同步、文档维护、构建验证和 `HERMES.md` 中断续接流程。
