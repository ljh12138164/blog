# 个人博客

一个使用 Nextra 4 Custom Theme、Next.js、Tailwind CSS、Turbopack 和 pnpm 构建的中文个人博客。生产环境导出为静态站点，由服务器 Nginx 直接提供服务。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建与搜索索引

```bash
pnpm build
```

`pnpm build` 生成 `out/` 静态站点；`postbuild` 随后生成 `out/_pagefind` 搜索索引，以及 `sitemap.xml` 和 `robots.txt`。开发模式下尚未生成索引时，搜索框会给出提示。

## SEO 配置

复制 `.env.example` 为 `.env.local`，将 `NEXT_PUBLIC_SITE_URL` 改为正式域名。该值用于 canonical、Open Graph、`sitemap.xml` 和 `robots.txt`。部署平台也可以单独提供 `SITE_URL` 给 `next-sitemap`。

新增文章时，需要同时：

1. 在 `app/posts/<slug>/page.mdx` 新建文章。
2. 在 `lib/posts.ts` 添加文章摘要，供首页文章列表读取；sitemap 会在构建后自动发现文章路由。

## 自动部署

推送到 `master` 后，GitHub Actions 验证并构建静态站点，再通过受限 SSH 命令将产物发布到服务器。完整的变量、密钥、回滚和排障说明见 [部署文档](docs/deployment.md)。

## 项目维护 Skill

项目级 Skill 位于 `.agents/skills/maintain-blog`。它规定了文章元数据同步、文档维护、构建验证和 `HERMES.md` 中断续接流程。
