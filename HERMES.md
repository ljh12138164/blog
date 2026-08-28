# Hermes

## 当前目标

在 `feat/cloudflare-early-hints` 中为静态博客生成并提供 Cloudflare 103 Early Hints 所需的路由级 `Link` 响应头，并通过 Pull Request 交付。

## 状态

进行中。

- 用户确认本地 `master@b4e6c9c` 是最新基线；GitHub 远端拉取因网络不可达失败两次。
- 用户要求把现有 `app/layout.tsx`、`next-env.d.ts` 和生成产物改动合并到同一 PR。
- 用户确认删除 `CONTEXT.md`、`MISSION.md`、`NOTES.md`、`RESOURCES.md` 与 `skills-lock.json` 是有意改动，必须保留并合并提交。
- 开发契约与可行性记录在 `docs/development/cloudflare-early-hints.md`。

## 验证

- Early Hints 聚焦测试：4 项通过，并完成 RED→GREEN。
- `pnpm typecheck`：通过。
- `pnpm build`：通过，导出 42 个静态页面；Pagefind、sitemap 与 SEO 校验通过。
- 生成 39 条有效页面映射；排除了 Next.js 错误页。
- `docker compose config` 与挂载真实配置的 `nginx -t`：通过。
- 真实 Nginx 响应验证：首页和文章页含 CSS preload 与 preconnect `Link`；静态 CSS 和健康检查不含页面级 Link。
- 完整 Docker 构建被本机腾讯云镜像代理在解析 `node:22-alpine` 时返回 404 阻塞；项目配置尚未进入构建阶段，CI 将执行完整镜像构建。
- 独立复审无剩余 Critical 或 Important，且没有需要 roadmap 的已接受后续项。

## 下一步

完成最终差异审查与全量新鲜验证，处理阻塞发现后提交并创建 PR。
