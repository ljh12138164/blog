# Biome 提交前检查

## Background

仓库缺少统一的代码检查命令与提交前自动检查，容易让可自动修复的格式和 lint 问题进入提交。

## Scope

- 使用 Biome 执行代码 lint 与格式化。
- 使用 simple-git-hooks 安装 `pre-commit` 钩子。
- 使用 lint-staged 仅检查并修复暂存的 JavaScript、TypeScript、JSON 和 CSS 文件。
- 优化根布局中的 Google 脚本加载时序，同时保留服务端输出的 JSON-LD。

## Out of scope

- 不一次性格式化全部历史文件。
- 不修改既有搜索组件、图片组件或第三方服务标识。
- 不增加 commit message 规范。

## Acceptance criteria

- `pnpm install` 可安装 `pre-commit` 钩子。
- 提交时 Biome 只处理暂存且受支持的文件。
- 全仓 lint、类型检查和静态构建通过。
- AdSense 延迟到浏览器空闲时加载，GA 在交互后加载，JSON-LD 保留在静态 HTML 中。

## Feasibility

可行。Biome 2、simple-git-hooks 与 lint-staged 均支持当前 Node.js 和 pnpm 项目。仓库历史文件未统一格式化，因此全仓命令只执行 lint，格式化由显式命令或暂存文件钩子渐进完成。

## Implementation

Biome 使用推荐规则，并为项目有意使用的静态 JSON-LD 关闭 `noDangerouslySetInnerHtml`。既有搜索组件不符合 `useExhaustiveDependencies`，为避免扩大本次范围暂时关闭该规则。GA 先建立 `dataLayer` 队列再加载远端脚本，二者均使用 `afterInteractive`；AdSense 使用 `lazyOnload`。

## Verification

- `pnpm check`：通过，保留一个既有 `<img>` 性能警告。
- `pnpm typecheck`：通过。
- `pnpm exec lint-staged --diff=HEAD`：通过；测试产生的暂存状态已撤销。
- `pnpm build`：42 个静态页面生成成功，Pagefind、sitemap 与 SEO 校验完成。
- `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`：均存在。
- 首页静态 HTML 包含 GA、AdSense 与 JSON-LD 标记。

## Risks

首次提交历史上未经过 Biome 的文件时，该文件可能产生较大的格式差异；lint-staged 不会改动未暂存文件。AdSense 的首屏初始化会因 `lazyOnload` 稍晚，这是降低首屏资源竞争的预期权衡。
