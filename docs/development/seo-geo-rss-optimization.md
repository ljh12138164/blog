# SEO 与 GEO 全面优化与自动化 RSS 支持

## Background

为了提升博客在传统搜索引擎（Google、Bing、Baidu）和生成式 AI 搜索引擎（ChatGPT Search、Claude、Perplexity、Google AI Overviews）中的可发现性、可引用性与新鲜度（Recency），对现有爬虫策略、RSS 订阅链路、Schema 实体图谱及机器可读入口进行全量优化。

## Scope

- 在 `next-sitemap.config.cjs` 与 `public/robots.txt` 中显式配置 `OAI-SearchBot`、`Claude-SearchBot`、`Google-Extended` 策略，并修正生产域名指向。
- 新增零外部依赖的原生 RSS 2.0 生成脚本 `scripts/generate-rss.mjs`，包含单元测试 `scripts/generate-rss.test.mjs`，接入 `postbuild` 流水线并在 `scripts/verify-seo.mjs` 中增加静态产物校验。
- 在 `app/layout.tsx` 的 `<Head>` 中注入 `feed.xml` 和 `llms.txt` 的 `<link rel="alternate">` 声明。
- 在 `app/_components/site-shell.tsx` 的页脚中暴露 `RSS 订阅` 与 `llms.txt` 直达链接。
- 在 `app/_components/article.tsx` 中打通文章 JSON-LD 节点与全站 `#website`、`#author`、`#organization` 的知识图谱关联，并补充 `abstract` 字段。

## Out of scope

- 破坏性修改 MDX 文章正文（由计划任务周期性复盘）。
- 引入重量级外部 RSS 依赖库。

## Acceptance criteria

- `pnpm typecheck` 0 错误。
- `pnpm test:unit` 全部单元测试通过（含新增的 RSS 生成测试）。
- `pnpm build` 顺利产出 `feed.xml`、`llms.txt`、`sitemap.xml`，且静态 SEO 校验 100% 通过。
- `pnpm check` Biome 代码规范校验通过。

## Feasibility

完全可行。采用 Node.js 原生 API 实现 XML 生成，无任何额外依赖；Schema.org 属性严格遵循官方规范与 Google Search Central 指南。

## Implementation

1. 优化 `next-sitemap.config.cjs` 与 `public/robots.txt`。
2. 编写 `scripts/generate-rss.mjs` 与测试文件，接入 `package.json` 的 `test:unit` 与 `postbuild`。
3. 扩展 `scripts/verify-seo.mjs` 覆盖 `out/feed.xml`。
4. 在 `app/layout.tsx` 与 `app/_components/site-shell.tsx` 增加 RSS 和 llms 发现机制。
5. 在 `app/_components/article.tsx` 的 JSON-LD 增加 `isPartOf`、`abstract` 及 `@id` 关联。

## Verification

- `pnpm typecheck`: 通过。
- `pnpm test:unit`: 15 个测试全部通过。
- `pnpm build`: 46 个静态页面成功导出，SEO 校验通过。
- `pnpm check`: Biome 检查无任何问题。

## Risks

无。RSS 和 robots.txt 均为向后兼容的标准协议输出，不影响已有前端交互与静态部署链路。
