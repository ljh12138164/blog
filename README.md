# 模型之外

一个使用 Nextra 4 Custom Theme、Next.js、Turbopack 和 pnpm 构建的中文个人博客。

## 本地运行

```bash
pnpm install
pnpm dev
```

## 构建与搜索索引

```bash
pnpm build
pnpm start
```

`postbuild` 会先扫描 Next.js 的服务端 HTML，在 `public/_pagefind` 生成 Pagefind 索引，再由 `next-sitemap` 根据构建产物自动生成 `sitemap.xml` 和 `robots.txt`。开发模式下尚未生成索引时，搜索框会给出提示。

## SEO 配置

复制 `.env.example` 为 `.env.local`，将 `NEXT_PUBLIC_SITE_URL` 改为正式域名。该值用于 canonical、Open Graph、`sitemap.xml` 和 `robots.txt`。部署平台也可以单独提供 `SITE_URL` 给 `next-sitemap`。

新增文章时，需要同时：

1. 在 `app/posts/<slug>/page.mdx` 新建文章。
2. 在 `lib/posts.ts` 添加文章摘要，供首页文章列表读取；sitemap 会在构建后自动发现文章路由。
