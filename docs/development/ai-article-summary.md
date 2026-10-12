# 文章头部 AI 摘要

## Background

为技术长文增加阅读前摘要，让读者先了解内容与关键边界。用户已确认静态摘要、原有青绿色细边线、默认展开且可收起的方案，并指定 Impeccable 与 humanizer-zh。

## Scope

- 为全部 39 篇 `/posts/<slug>` 文章逐篇生成 80–150 字摘要。
- 在文章信息之后、目录之前显示摘要；关于与隐私页面不显示。
- 保留原有正文、简介、SEO 元数据和路由。
- 按用户预览反馈，移除文章头部的作者头像、姓名与职业，保留日期和阅读时长。

## Out of scope

在线模型调用、后台编辑器、批量改写文章、自动生成或重新生成摘要。

## Acceptance criteria

- 所有现有文章均有独立摘要，关键事实与限定可在正文中找到。
- 默认展开，可用鼠标、触摸和键盘收起或展开，禁用 JavaScript 时仍可用。
- 桌面及 390px 手机视口在明暗主题下可读，无横向溢出。
- 类型、Lint、测试、生产构建及静态产物检查通过。

## Feasibility

可行。复用 Next.js 16.0.7、Nextra 4.6.1、React 19.1.0、Tailwind CSS 4.3.3 与现有 Article 包装器。原生 details/summary 负责展开状态、键盘与辅助技术语义，不引入客户端组件或依赖。

摘要以 slug 为键存入 `lib/article-summaries.ts`，避免把非标准字段写入 Next.js metadata。修改文章时同步维护此文件；覆盖测试检查新增或删除文章造成的遗漏。摘要不进入 Pagefind 索引，避免与正文重复影响搜索片段。

CI 的文章测试步骤同时执行摘要覆盖检查，新增或删除文章时必须同步维护摘要。

## Implementation

复用已确认的 `docs/superpowers/specs/2026-09-01-personal-tech-notebook-ui-design.md` 中的窄栏、语义颜色、系统字体与无阴影设计。此次只扩展文章头部，不调整全站视觉系统。

设计依据：已读取 Impeccable 官方 SKILL.src.md、shape、new-work 与 craft-floor；本地启动器不可用，直接读取现有代码与设计记录。UI Skills MCP 的 interface-design 与 baseline-ui 已加载。内容依据 humanizer-zh 保留信息和确定程度，不新增数字、经历或性能承诺。

摘要使用主要文字色、略小于正文的字号与 1px 强调色左边线。展开按钮保留文字标签与可见焦点，触摸区域至少 44px。只包含展开与收起状态，无加载或生成状态。

头部不再显示作者身份栏，日期和阅读时长继续靠右显示。改动复用所有文章的 Article 包装器；正文末尾的作者简介与结构化作者数据保持原样。

## Verification

- 摘要覆盖测试先在空摘要集上失败，补齐后 2/2 通过；核对全部 39 篇正文与摘要。
- `pnpm typecheck`、`pnpm check` 通过，受影响源码的 Biome 格式检查通过。
- `pnpm test`：10 个测试文件、26 项测试全部通过。
- `pnpm build`：50 个静态页面与完整 postbuild 流水线通过，包括 Pagefind、SEO、Early Hints、Service Worker 与预压缩。
- 导出 HTML 检查：39/39 文章恰有一个默认展开的摘要，位于文章 header 内且排除 Pagefind；关于与隐私没有摘要。
- 移除头部作者栏后，重新通过类型检查、受影响组件的 Biome 检查、2 项摘要覆盖测试及完整生产构建；通过本地 HTTP 逐篇检查 39/39 文章保留摘要与日期、无头部作者链接。
- `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt` 和 `out/sw.js` 存在。
- 本地生产产物 `/posts/nextra-blog-setup` 在 1280px 桌面与 390px 手机的明暗主题中完成视觉检查；摘要正文 15px / 28.5px 行高，控件高度 44px，无页面级横向溢出。
- 鼠标收起、Enter 展开、2px 键盘焦点已确认；禁用 JavaScript 并刷新后，Space 收起与 Enter 展开仍正常。
- 独立审查逐篇核对摘要及 Article 实现，无阻塞或接受的后续项，因此不新增空路线图。

首次验证因本机缺少已声明的 `workbox-build` 导致 Service Worker 测试及 postbuild 失败；执行 `pnpm install --frozen-lockfile` 恢复依赖后，测试与完整构建通过，未修改 manifest 或 lockfile。构建产生的 `next-env.d.ts` 与 RSS 构建日期差异已恢复。

交付：`feat/ai-article-summary` 已推送，[PR #28](https://github.com/ljh12138164/blog/pull/28) 已创建并附加到当前任务。远端 verify 检查在交付时仍运行中；本次未合并或部署。

## Risks

静态摘要不会随正文自动更新，需编辑者同步核对。内容覆盖测试能发现遗漏，不能自动证明摘要语义与正文一致。
