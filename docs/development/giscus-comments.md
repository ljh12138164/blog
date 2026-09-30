# Giscus 评论接入

## Background

博客源码仓库保持私有，读者评论存放于独立公开仓库 `ljh12138164/blog-comment`。沿用 [P1 路线图](../roadmaps/monetization-and-engagement.md) 的方案。

## Scope

在文章底部接入 Giscus，按文章路径区分讨论，并同步博客明暗主题。

## Out of scope

广告位、文章重排、服务端评论存储和生产部署。

## Acceptance criteria

- 每篇文章底部显示评论区，并能登录 GitHub 发布评论。
- 评论进入 `blog-comment` 仓库的 Discussions，按路径隔离。
- 博客切换明暗主题时，评论区同步更新。
- 静态导出与现有 SEO 产物保持可用。

## Feasibility

文章共用 `Article` 包装组件，可在正文之后统一插入评论区。站点主题写在根元素 `data-theme`，客户端可观察该属性。`blog-comment` 为公开仓库，Repository ID 为 `R_kgDOUjGFLg`；GitHub Discussions 已启用，用户提供的 `General` 分类 ID 为 `DIC_kwDOUjGFLs4DGsrC`。现有 UI 技术栈为 React 19、Tailwind 4 和 Nextra 4；复用现有文字、边框及间距，不新增视觉系统。已读取 UI Skills 的 `dammyjay93/interface-design` 与 `ibelick/baseline-ui`。

## Implementation

使用 `@giscus/react` 客户端组件，`pathname` 映射，同步 `data-theme`。UI 面向读完文章的读者，主要动作是登录 GitHub 并留言；正文仍是视觉焦点，评论区以现有边框和文字层级承接正文。入口为各文章页尾，无新增页面。桌面与移动端沿用文章宽度。

## Verification

- `pnpm typecheck`：通过。
- `pnpm build`：通过；`out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml` 和 `out/robots.txt` 均存在。
- 待验证：真实评论加载与主题切换。

## Risks

真实 GitHub 登录与留言需要在可访问的浏览器中验证。
