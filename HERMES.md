# Hermes

## 当前目标

使用 `teach` 教学方法重写 `app/posts` 中除《Cloudflare 的优选 IP 优化》外的全部 35 篇文章，并为适合的流程、时序、状态和架构内容加入 Mermaid。

## 状态

已完成。分支为 `feat/teach-rewrite-posts`。

- 35 篇目标文章均有实质改动，并保留原 URL 与 metadata。
- 每篇文章都有明确学习目标和自检出口；旧文中的可运行示例继续保留。
- 架构、时序与状态类文章补充 Mermaid；当前 29 篇文章包含 Mermaid。
- 本轮剩余 32 篇均补充对应官方资料入口。
- 《Cloudflare 的优选 IP 优化》未改动，Git Blob 哈希保持 `7c259aebc8ffefb0df602882745b3e766407ab4d`。
- pnpm 严格依赖下，为 Nextra Mermaid 编译补充直接依赖 `@theguild/remark-mermaid@0.3.0`。

## 验证

- `pnpm typecheck`：通过。
- `pnpm build`：通过，生成 42 个静态页面。
- Pagefind：索引 38 个页面。
- `llms.txt` / `llms-full.txt`：索引 36 篇文章。
- sitemap 与全量 canonical 校验：通过。

## 已知提示

构建会提示 `baseline-browser-mapping` 数据超过两个月未更新，但不影响类型检查、静态导出、搜索索引或 SEO 校验。本次文章重写没有顺带升级该依赖。

## 下一步

无阻塞项。可以进行内容审阅并创建 PR。
