# Hermes

## 状态：空闲
- 目标：编写新博文《项目接入 Umami 统计：基于 Vercel 与 Supabase 的零成本部署实践》（包含 4 处图片占位符），并同步更新 lib/posts.ts 归档与相关发布链路。
- 完成内容：
  - 创建 `app/posts/umami-vercel-supabase/page.mdx`，遵循 `write-blog-post` 规范（自然工程师语调、无 AI 套话、Mermaid 数据流图、真实工程权衡与 4 处规范图片占位符）。
  - 更新 `lib/posts.ts`，在 `recentPosts` 与 `建站与专题` 归档组登记新文章。
  - 通过 `pnpm typecheck`（0 报错）、`pnpm test:unit`（13/13 passed）与 `pnpm build`（46 个静态页面导出、Pagefind 索引、Sitemap、llms.txt 增至 39 篇，SEO canonical 验证通过）。

## 下一步：无



