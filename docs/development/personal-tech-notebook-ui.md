# 个人技术手账 UI 重构

## Background

现有站点使用米白纸张、中文衬线、陶土橙和报刊分栏，容易呈现为通用 AI 生成的编辑型博客。用户选择以 AstroPaper 为参考的简洁结构，同时保留“个人技术手账”的现场注记语言，并正式支持明暗模式。

完整设计见 [个人技术手账 UI 设计](../superpowers/specs/2026-09-01-personal-tech-notebook-ui-design.md)。

## Scope

- 重构全站页头、页脚、首页、文章索引和共享文章排版。
- 统一关于、隐私、搜索和错误页面的主题与排版。
- 建立浅色与深色语义 token，并提供可持久化的主题切换。
- 覆盖桌面、平板和 390px 手机布局。

## Out of scope

- 新路由、新内容、新搜索或订阅能力。
- 新 UI、字体、图标、主题或动画依赖。
- SEO、文章数据、Pagefind、sitemap 与部署流程重构。
- 复制 AstroPaper 的品牌、文案或代码实现。

## Acceptance criteria

- 设计文档中的全部界面范围共享统一视觉系统。
- 明暗模式跟随系统、支持保存选择，并避免明显首次加载闪烁。
- 390px 视口无页面级横向溢出，键盘焦点和触摸目标可用。
- 主题、搜索、SEO 和静态导出无回归。
- 仓库检查、构建、静态产物和指定视口视觉检查通过。

## Feasibility

结论：可行。现有 Next.js、React、Nextra 与 Tailwind 能完成所需主题和布局，不需要新增生产依赖。

主要难点是首次绘制前的主题初始化、Shiki 明暗代码 token、遗留硬编码颜色，以及窄屏长内容溢出。实施必须以语义 token、最小客户端主题状态和代表页面双主题视觉验证解决这些问题。

已加载 UI Skills 注册表中的 `dammyjay93/interface-design` 与 `ibelick/baseline-ui`，并采用其单一焦点、语义 token、克制层级、可见焦点、44px 命中区域和无装饰动画约束。

## Implementation

尚未开始。用户正在评审设计方案；批准书面设计后再编写实施计划。

## Verification

计划运行：

- 受影响文件 Biome 检查。
- `pnpm typecheck`。
- `pnpm check`。
- `pnpm build`。
- 必需静态产物存在性检查。
- 首页、索引、代表文章、搜索与错误页的桌面/390px、浅色/深色视觉检查。

## Risks

- 主题初始化可能产生闪烁或 hydration 警告。
- Shiki 和 typography 插件中的硬编码颜色可能导致深色主题对比不足。
- 视觉收敛可能过度接近参考站；现场注记与本站信息结构必须保留。
- 文章中的宽表格、长代码和外链可能在 390px 下暴露既有溢出。
