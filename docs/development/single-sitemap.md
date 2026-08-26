# 单文件 sitemap

## Background

当前 `next-sitemap` 使用默认索引模式，构建后生成 `sitemap.xml` 索引和 `sitemap-0.xml` 分片。站点规模较小，只需要一个直接包含全部 URL 的 `sitemap.xml`。

## Scope

- 关闭 sitemap 索引与分片输出。
- 构建校验要求存在 `out/sitemap.xml`，且不存在 `out/sitemap-*.xml`。

## Out of scope

- 更换 sitemap 生成工具。
- 调整 URL、更新频率、优先级或 robots 策略。

## Acceptance criteria

- `pnpm build` 成功。
- `out/sitemap.xml` 直接包含站点 URL。
- `out/` 中不存在 sitemap 分片文件。
- `pnpm typecheck` 和 SEO 校验通过。

## Feasibility

可行。当前生成器原生支持 `generateIndexSitemap: false`；站点页面数量远低于单个 sitemap 的 50,000 URL 协议上限。主要风险是历史分片残留，因此校验必须显式拒绝 `sitemap-*.xml`。

## Implementation

在现有配置中关闭索引 sitemap，并移除只服务于分片的 `sitemapSize`。SEO 校验从要求分片存在改为要求分片不存在。

## Verification

- `pnpm typecheck`：通过。
- `pnpm build`：通过；`next-sitemap` 报告 0 个索引、1 个 sitemap。
- 产物检查：`out/` 中只有 `sitemap.xml`，根节点为 `<urlset>`，不存在 `sitemap-*.xml`。
- `git diff --check`：通过。
- 最终审查未发现阻塞问题，也没有需要进入 roadmap 的后续项。

## Risks

无迁移要求；搜索引擎继续访问原有 `/sitemap.xml` URL。
