# 文章发现与阅读体验

## Background
用户确认实现分类筛选、系列专栏与相关推荐、移动端目录、图片放大、搜索增强五项。基线为 `origin/master` 的 `89632c7`；Giscus、滚动进度和返回顶部已存在。

## Scope
- `/posts`：分类计数与筛选、Pagefind 全文结果、关键词与分类的可分享 URL、清除条件及空/错误状态。
- `/series`、`/series/[slug]`：三个策划系列的入口与阅读顺序；文章内显示所属系列、上下篇及相关推荐。
- 文章：窄屏可折叠目录、当前章节提示；图片点击/键盘放大与关闭。
- 搜索弹窗：真实结果总数、前六条预览和完整结果链接。

## Out of scope
真实更新时间、首页精选重排、阅读进度算法、评论配置、生产部署。

## Acceptance criteria
- 筛选/搜索可以组合，刷新和前进后退恢复 URL 状态；全部文章在静态 HTML 中可发现。
- 专栏链接均指向实际文章，上下篇边界正确；推荐去重、排除当前文章，优先同系列，再按相同分类。
- 手机/平板可展开目录并跳转，桌面保留侧栏；当前章节可辨认，标题不被页头遮挡。
- 非链接图片可用鼠标和键盘放大，Escape/关闭按钮退出，焦点返回；链接图片保留导航。
- 搜索加载、无结果、失败重试和超过六条结果都有明确反馈；不显示过期请求结果。
- 桌面、平板、390px 手机，明暗主题与键盘路径检查；typecheck、lint、unit、build 和 SEO 产物验证通过。

## Feasibility
结论：可行。Next 16.0.7 / Nextra 4.6.1 / React 19.1 / Tailwind 4.3.3，保持静态导出。`getAllPosts` 已提供完整文章元数据，Pagefind 已支持全文检索，Nextra 导出的 ImageZoom 和项目现有 CSS 可直接复用。无需新增依赖。

技术重点：查询参数只在客户端读取，静态导出用 Suspense 边界保持完整初始列表；搜索共享延迟加载的 Pagefind，防止异步旧结果覆盖新查询；系列与推荐在构建时生成，客户端不加载 Nextra page map；共用 Article 还覆盖关于/隐私页，系列与推荐仅对 `/posts/<slug>` 启用。

## Implementation
复用已接受的 `docs/superpowers/specs/2026-09-01-personal-tech-notebook-ui-design.md` 窄栏手账设计，以及 `docs/roadmaps/monetization-and-engagement.md` 的三个专栏决策。用户本轮确认前五项覆盖上述新页面和交互，不重复要求审批。保留 720px 主轴、系统无衬线/等宽字体、paper/ink/muted/line/accent 主题变量，4px 间距与 44px 点击区域；以有序章节与当前阅读位置作为视觉重点，不引入卡片网格、字体或 UI 库。

已加载 UI Skills：`dammyjay93/interface-design`、`ibelick/baseline-ui`。控件沿用原生 input/select/details/dialog 与 Nextra ImageZoom。分类区服务于定位文章，专栏页服务于连续阅读，目录与放大层服务于阅读当前正文；错误只展示在触发操作旁。

系列统一配置在 `lib/post-discovery.ts`，按策划顺序引用已有 slug；构建时从 MDX 读取标题等信息，缺失文章直接使构建失败。推荐先同系列、再同分类，排除当前文章并限制三篇。共享 `PostList` 保持归档与专栏排版一致。文章索引读取 URL 参数的客户端区域用完整归档作 Suspense fallback，无 JavaScript 仍有全部文章链接。

全文搜索弹窗和索引页共用 `usePostSearch`，共享 Pagefind 初始化 Promise；关键词更换取消旧请求的状态写入。浏览器会缓存失败的 ESM 导入，因此加载失败时清除 Promise 并在重试 URL 添加版本参数。搜索只返回真实文章，弹窗显示总数与六条预览，完整页可进一步交叉筛选分类。分类变化同时保存输入框尚未提交的关键词；只有关键词变化才重建输入框，分类控件保持焦点。

目录复用原生 details，窄屏展开/收起，桌面显示侧栏；滚动按实际标题位置更新 `aria-current`，使用 requestAnimationFrame 合并事件，标题留出页头与目录的滚动偏移。图片复用 Nextra ImageZoom 和既有主题 CSS，放大/关闭按钮命中区域调整为 44px；链接内图片沿用 Nextra 的导航保护。

`CONTEXT.md` 在仓库中不存在；以现有代码、设计文档和 roadmap 为依据。

## Verification
- `pnpm install --frozen-lockfile`：通过，未新增依赖。
- `pnpm typecheck`、`pnpm check`：通过。
- `pnpm test:unit`：21/21 通过；新增五项测试覆盖策划链接、排序、相关推荐、组合筛选与关键词 URL 编码，并接入 CI。
- `pnpm build`：50 个路由完成静态生成；RSS 与 LLM 索引各 39 篇，Pagefind 索引、sitemap、robots 和逐页 canonical 验证通过。
- `pnpm test:resource-hints`：1/1 通过。
- 使用实际 `out/` 静态导出在本机 127.0.0.1 预览，通过 Playwright + 已安装 Edge 验证。第三方统计/评论请求在测试中拦截，不发送测试访问数据。
- 分类计数、未知分类空状态、输入中的关键词保留、条件交叉筛选、刷新与前进后退恢复通过。
- `Cloudflare` 搜索真实返回 10 篇，弹窗六条预览，完整结果链接展示十篇；无结果和模拟索引加载失败后的成功重试通过。Ctrl+K 键盘入口正常。
- 专栏阅读顺序、首篇无上一篇/末篇无下一篇、推荐三篇去重与排除自身通过；关于页不显示文章推荐。
- 禁用 JavaScript 后仍可访问全部 39 篇文章链接。
- 1440px、768px、390px 的明暗六组合：索引/专栏/目录/图片视觉检查，页面无横向溢出；目录点击关闭与标题偏移、当前章节、键盘导航；图片点击/Enter 放大、Escape/按钮关闭与焦点返回通过。浏览器 pageerror 为零。
- 复核实现标准与验收条件：阻塞发现“失败导入无法重试”已修复并重测；无剩余阻塞，无新增接受的后续项，因此不创建空 roadmap。已有专栏 roadmap 标记完成并链接本文。

本机 QA 脚本、报告与截图保存在临时目录 `C:/Users/34792/AppData/Local/Temp/blog-reading-qa`，未引入仓库依赖或测试工具配置。

PR：[文章发现与阅读体验 #27](https://github.com/ljh12138164/blog/pull/27)。GitHub CI 状态与审查反馈见 PR；未发布生产。

## Risks
Pagefind 依赖完整生产构建生成索引；浏览器验证应使用静态导出。推荐采用可解释的系列/分类规则；不引入向量检索。
