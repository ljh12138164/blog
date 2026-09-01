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

- 新增纯函数 `resolveTheme`、绘制前主题初始化脚本和持久化主题按钮；首次访问跟随系统，手动选择写入 `blog-theme`。
- 将全局颜色重构为浅色/深色语义 token，并为 Shiki、内联代码、引用、表格、图片和搜索遮罩建立主题样式。
- 页头、页脚、搜索和错误状态统一到 720px 轴线；搜索与主题按钮均为 44px 原生按钮。
- 首页改为作者主张、现场注记、最新手记、三篇置顶手记、专题索引与关于入口。
- 文章索引保留年份分组和跳转，移除装饰性时间轴。
- 文章正文收敛到 680px；桌面目录为 180px，移动端隐藏；代码与表格在自身容器内滚动。
- 浏览器验证发现任意 `clamp(...)` 字号在本次 Tailwind 构建中未生成规则，已改为可稳定生成的离散响应式字号。
- 深色文章头部位于 `not-prose`，不会继承 typography heading token；已显式绑定 `text-ink`。

## Verification

- `pnpm test:theme`：2 个测试通过；覆盖保存主题优先级、系统主题回退和无效保存值。
- `pnpm check`：36 个文件通过，无 lint 错误。
- `pnpm typecheck`：通过，无 TypeScript 错误。
- `pnpm build`：通过；44 个静态页面生成成功，Pagefind 索引 39 页，sitemap 生成成功，SEO 校验确认每页只有一个正式域名 canonical。
- 静态产物存在：`out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`。
- 桌面共享层：导航实际宽 720px；导航、搜索按钮、主题按钮均有可访问标签；搜索打开后自动聚焦输入框，并保留 `aria-live` 状态。
- 390px 共享层：导航实际宽 347px；搜索与主题按钮均为 44×44px；页面 `scrollWidth === clientWidth`。
- 主题持久化：浏览器从深色切换到浅色后刷新，根节点仍为 `data-theme="light"`，背景为 `rgb(253, 253, 252)`。
- 首页：桌面与 390px、浅色与深色均完成检查；390px H1 实际 42px、最新文章标题 28px，无页面级横向溢出。
- 文章索引：渲染 37 个文章链接和 2024–2026 年分组；桌面与 390px、浅色与深色无页面级横向溢出。
- 代表文章 `/posts/type-safe-routing`：桌面正文 680px、目录 180px；深色 H1/H2 为 `rgb(231, 234, 235)`；390px H1 为 36px、目录隐藏、页面无横向溢出。
- 代表文章代码块：390px 可视宽 347px、内容宽 432px，仅代码容器横向滚动。
- 搜索初始状态完成浏览器检查；生产构建生成的 Pagefind 索引成功。运行时 500 页面没有人为触发，视觉检查限于共享 `ErrorState` 的 404 变体与源码一致性。
- 构建保留两个既有非阻断警告：`baseline-browser-mapping` 数据较旧，以及用户目录存在额外 lockfile 导致 Next.js workspace root 推断提示。

## Risks

- 主题初始化可能产生闪烁或 hydration 警告。
- Shiki 和 typography 插件中的硬编码颜色可能导致深色主题对比不足。
- 视觉收敛可能过度接近参考站；现场注记与本站信息结构必须保留。
- 文章中的宽表格、长代码和外链可能在 390px 下暴露既有溢出。
- 运行时 500 状态依赖真实异常触发，本次未为了截图向生产组件添加测试后门。
