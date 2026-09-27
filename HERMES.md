# Hermes

## 状态：已完成并准备发起 PR
- 目标：全面优化博客 SEO 与 GEO（AI 搜索）指标，补齐 AI 爬虫策略、RSS 订阅源、Schema 知识图谱关联及机器可读入口。
- 完成内容：
  - 更新 `next-sitemap.config.cjs` 与 `public/robots.txt`，补齐 `OAI-SearchBot`、`Claude-SearchBot`、`Google-Extended` 策略。
  - 新增原生 RSS 2.0 生成脚本 `scripts/generate-rss.mjs` 与单元测试 `scripts/generate-rss.test.mjs`，接入 `postbuild` 与 `test:unit`。
  - 增强 `scripts/verify-seo.mjs`，对 `feed.xml` 进行静态导出校验。
  - 在 `app/layout.tsx` 与 `app/_components/site-shell.tsx` 增加 `RSS 订阅` 与 `llms.txt` 的发现与直达入口。
  - 在 `app/_components/article.tsx` 中打通文章 JSON-LD 与站点 `#website`、`#author`、`#organization` 的知识图谱关联。
  - 通过全部测试与验证：`pnpm typecheck`（0 报错）、`pnpm test:unit`（15/15 passed）、`pnpm build`（46 个页面全量导出、SEO 静态检验通过）、`pnpm check`（Biome 0 报错）。

## 下一步：向远程仓库推送分支并合并 PR
