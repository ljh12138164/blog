# 优化 Google 第三方脚本加载

## Background

根布局目前在 `<head>` 中直接加载 AdSense，并用两段 `next/script` 手工初始化 Google Analytics。改用 Next.js 官方第三方组件与延迟加载策略，减少首屏阶段的第三方脚本竞争并降低维护成本。

## Scope

- 使用 `@next/third-parties/google` 的 `GoogleAnalytics` 组件加载现有 GA4 Measurement ID。
- 将现有 AdSense 脚本移到 `<body>` 末尾，并使用 `lazyOnload` 策略。
- 删除被替代的手写 GA 与 `<head>` AdSense 脚本。

## Out of scope

- 不变更 GA4 Measurement ID、AdSense Publisher ID、广告位或 consent 模型。
- 不改变页面结构、样式或可见交互。

## Acceptance criteria

- 每个页面仅加载一次 GA 和一次 AdSense 引导脚本。
- GA 由 Next.js 官方 `GoogleAnalytics` 组件接入。
- AdSense 使用 `next/script` 的 `lazyOnload` 策略且保留 `crossOrigin="anonymous"`。
- 类型检查、静态构建及规定的导出产物检查通过。

## Feasibility

可行。项目使用 Next.js 16 App Router，根布局已有集中式脚本入口。需要新增与当前 Next.js 版本配套的 `@next/third-parties` 运行时依赖。主要风险是新旧实现并存导致重复采集或重复请求，解决方式是原位完整替换，并检查构建产物。

## Implementation

保持 `site.googleAnalyticsId` 与现有 Publisher ID 作为单一现有配置来源，不引入额外抽象或环境变量。

根布局使用 `GoogleAnalytics` 替换原有的两个手写 GA 脚本；AdSense 从 `<head>` 移到 `<body>` 末尾，并由 `next/script` 以 `lazyOnload` 策略加载。新增与 Next.js 版本一致的 `@next/third-parties@16.0.7`。

## Verification

- `pnpm typecheck`：通过。
- `pnpm build`：通过；42 个静态页面导出成功，Pagefind、sitemap 与 SEO 校验通过。
- `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`：均存在。
- `out/index.html`：GA 与 AdSense 加载 URL 各出现一次。
- 完成差异复核，无阻塞问题或需进入 roadmap 的后续项。

## Risks

`lazyOnload` 会让 AdSense 在浏览器空闲阶段才加载，首屏广告初始化可能稍晚；这是本次性能优化的预期权衡。
