# 个人博客

一个使用 Nextra 4 Custom Theme、Next.js、Tailwind CSS、Turbopack 和 pnpm 构建的中文个人博客。生产站点是静态导出内容，封装于项目管理的 Docker 镜像中。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建与搜索索引

```bash
pnpm build
```

`pnpm build` 生成 `out/` 静态站点；`postbuild` 随后生成 `out/_pagefind` 搜索索引、`sitemap.xml` 和 `robots.txt`。

## SEO 配置

复制 `.env.example` 为 `.env.local`，将 `NEXT_PUBLIC_SITE_URL` 改为正式域名。该值用于 canonical、Open Graph、`sitemap.xml` 与 `robots.txt`。

新增文章时，需要同时：

1. 在 `app/posts/<slug>/page.mdx` 新建文章。
2. 在 `lib/posts.ts` 添加文章摘要，供首页文章列表读取。

## 自动部署

推送到 `master` 后，GitHub Actions 会验证站点、构建不可变 `blog:sha-<commit>` Docker 镜像，并将镜像和仓库中的 Compose、Nginx、部署配置通过受限 SSH 发送到服务器。服务器只导入并运行本地镜像，不构建站点、不访问 GHCR 或 GitHub Packages。

完整的首次服务器引导、变量、回滚和排障说明见 [部署文档](docs/deployment.md)。

## 项目维护 Skill

项目级 Skill 位于 `.agents/skills/maintain-blog`，规定文章元数据同步、文档维护、构建验证和 `HERMES.md` 中断续接流程。
