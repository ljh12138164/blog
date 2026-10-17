# AdSense、作者资料与正式域名迁移

## Background

AdSense 将 ljhboard.cn 标记为低价值内容。2026-10-17 后台 ads.txt 显示已授权，所有权区域选用代码段。根域名和 blog 均能返回博客 HTML，但 canonical 仍为 blog。

## Scope

- AdSense 在 head 中输出原生 async script，保留验证 meta，避免 Rocket Loader 改写该脚本。
- 正式 URL 改为 https://ljhboard.cn，同步作者、结构化数据、生成文件、部署校验与运维文档。
- 将 self 首页整体迁入博客“关于我” `/about`：作者、四站作品与预览、工具直达、贡献蛇、三项贡献与技术栈，文末仅保留联系方式，按用户要求移除最近文章与做事/写作/引用说明；`/privacy` 同步实际服务。逐项对照见[迁移清单](../self-site-migration.md)。博客首页 `/` 保留原文章布局。
- 打磨建站与 SEO 文章，补版本、仓库链接、可运行检查和适用边界。
- 只读核查 AdSense、GSC 代表文章和 Cloudflare 安全事件，记录时间范围与证据局限。

## Out of scope

自动申请 AdSense 复审、购买流量、编造经历或测量、修改独立工具站、未经发布验证就关闭 self 或跳转旧博客。

## Acceptance criteria

- 导出 HTML 在 head 中仅有一份正确的 AdSense 外链脚本，meta 与 ads.txt 保留。
- canonical / og:url、sitemap、RSS、robots 指向根域名，部署校验同步。
- /about 包含联系方式、作品、可追溯贡献与原站技术图标；按用户要求移除最近文章和文末其他说明，不新增页面或 UI 依赖。
- `/about` 完整承接个人站内容及本地资产，分类筛选、图片放大、贡献折叠、明暗贡献蛇静态快照可用，不配置 cron 或生成任务；不把本地/历史快照声称为实时数据。博客首页源码与原分支一致。
- 两篇代表文章补可核查依据，不把待发布内容说成已上线。
- typecheck、生产构建、相关测试通过；明确后台验证局限。

## Feasibility

可行。Next.js 16.0.7、React 19.1.0、Nextra 4.6.1、Tailwind 4.3.3，纯静态导出。site.config.json 是域名来源；部署 canonical 断言需同步，否则新版本健康检查失败。

根域名已提供 HTML，边缘根域名到 blog 的旧重定向处于禁用状态。blog 到根域名、self 到 /about 的跳转在新内容上线验证后切换，避免环路与丢失旧路径。源站 ai 域名及证书路径属于现有回源链路，不能机械替换。

完整迁移可行：原站为 Astro，但资料、条目、WebP 和 SVG 可直接迁入；React 组件使用现有 Next/Nextra，无需嵌入第二个运行时。较完整数据来自 homepage-content 工作树 `5c53bca`，本地 master `d2ead4e` 滞后于线上，因此不能只取 master。原项目只读。

关键约束：用户明确不需要贡献蛇生成任务；使用仓库内的静态快照，不设置 cron、生成 action 或跨任务 artifact 传递。远端 GitHub 数量失败时保留注明日期的快照，PR 状态注明原核实日期。图片缩放复用 Nextra ImageZoom，不复制原站弹层和缓存系统。

## Implementation

复用 `docs/superpowers/specs/2026-09-01-personal-tech-notebook-ui-design.md` 已确认的窄栏、系统字体、teal、明暗色差及 4px 间距。用户明确要求 self 完整首页迁入“关于我” `/about`，博客首页保持文章布局；该页面归属已记录在 AGENTS.md。再次加载 UI Skills `dammyjay93/interface-design`、`ibelick/baseline-ui`，未引入 UI 库。

界面约定：`/about` 供访客认识作者、选择工具、核对贡献、进入文章，焦点为姓名及个人介绍；网站使用预览图加文字行，贡献以问题与 PR 为主。保留技术分类与贡献折叠，图片使用现有 ImageZoom；技术栈恢复原项目 SVG 图标，使用本地图标常量；文末只保留联系方式，删除不再使用的 MDX 嵌入文件与类型声明。`/privacy` 说明合并后的服务。

状态包括分类选中、贡献展开/收起、预览开/关、统计成功/失败快照、明暗主题。范围为桌面、平板、390px 手机及鼠标、触摸、键盘；不增加路由、表单、后台或认证。

作者资料依据 self 站和 GitHub 公开记录，贡献直接链接 PR，不用项目 star 数证明个人贡献。采用 ponytail 最小改动原则，不加依赖。

个人资料在 `lib/profile.ts`，技能条目在 `lib/profile-skills.ts`，本地资产在 `public/profile/`。原站旧 favicon、字体、SW、广告与统计初始化由博客现有能力接管，不重复注入；失真的“当前在线”状态不沿用。贡献蛇按用户要求使用存档，不配置定时生成；构建直接读取本地资产。

建站文章改正版本、容器端口与浮动包管理器示例，固定代码证据到基线提交；SEO 文章增加真实 GSC 观察，删除未提供图片的截图占位，修正已存在 Article image 的描述。保留原始发布日期，在正文标明核对时间，不编造性能采样。

部署检查正常发布仅接受根域名，首次迁移回滚允许旧 blog canonical。未改源站 ai 的证书、回源、服务器配置或线上 Cloudflare 规则。

## Verification

- `pnpm typecheck` 通过。
- `pnpm build` 通过：39 篇文章、Pagefind 41 页、单一 sitemap，全部导出 HTML 的根域名 canonical 与静态 AdSense 断言通过。文章示例修订后再次构建验证。
- `pnpm test:unit` 9 文件 / 25 项、`pnpm exec vitest run scripts/personal-hub.test.mjs scripts/resource-hints.test.mjs` 2 文件 / 4 项通过，包含迁移位置、静态内容与本地图片；已移除每日生成链路的测试。
- 对改动的 TS/JS/JSON 执行 Biome 检查与格式化通过；无依赖或无关格式调整。
- Git Bash 对 `deploy/server/deploy-blog` 执行 `bash -n` 通过；隔离 curl 的健康检查验证：新 root 接受，旧 blog 在正常发布拒绝、回滚接受，外部域名拒绝。默认 WSL bash 不可用，改用系统已安装 Git Bash。
- 删除导出首页 AdSense script 的受控负向检查被 `verify:seo` 正确拒绝，随后原样恢复并再次校验通过。
- 迁移前的关于页草稿截图不代表完整交付；本轮以完整 `/about` 的桌面和 390px 手机实测、分类与图片预览检查为准。最终截图另存为 `about-migrated-desktop.png`、`about-migrated-desktop-projects.png` 与 `about-migrated-mobile-light.png` / `about-migrated-mobile-dark.png`。桌面与 390px 手机无页面横向溢出，贡献图区域可用方向键横滚；分类、图片打开/关闭与原生贡献折叠有效。
- 原生 AdSense 在 hydration 前向 head 插入托管脚本，可导致 React 将其误认作主题/JSON-LD 内联脚本。本轮将这两个同步脚本移至 body 的最前方，主题仍在正文绘制前初始化；AdSense 仍在 head 静态输出。开发预览刷新后无新增同类水合错误。
- 原站两张 GitHub 实现截图外链在本地浏览器加载失败；下载原图迁入 `public/profile/` 并校验 PNG 完整性，不再依赖图片外链。
- 用户指定的最近文章及文末说明已从初始 HTML 移除，只保留联系方式；43 个技术栈 SVG 从原项目恢复，筛选后图标随条目切换，深色模式的单色图标继承正文颜色。新增截图 `about-skills-restored-desktop.jpg`、`about-contact-only-desktop.jpg` 与 `about-skills-restored-mobile-dark.jpg`。
- 本地 `/stats/` 404 属于未经过 Nginx 统计代理的预览环境，生产代理不在本次修改范围。
- 后台实证见 [AdSense 与搜索核查](../adsense-search-audit.md)。未提交复审或更改线上规则。

## Review

按仓库规范与本文件验收逐项审阅：已解决首次迁移回滚 canonical 不兼容、教程过时配置、截图占位与无依据镜像体积。完整迁移复审检查了 /about 归属、首页源码未变化、初始 HTML 的 43 个技能与对应 SVG、指定内容删除、联系方式保留、图片资源、第三方失败快照、主题水合和静态资产完整性；无未解决的代码阻断项。

接受的后续工作为生产迁移和搜索系统观察，以及依据具体失败 URL 继续处理历史索引问题；顺序与完成信号见 [roadmap](../roadmaps/adsense-trust-domain.md)。拒绝按 Googlebot 用户代理全站放行、复制双站点作为长期主站、以固定流量或天数承诺过审：本次证据不支持。

## Delivery

已创建 [PR #29](https://github.com/ljh12138164/blog/pull/29)，分支 `feat/adsense-trust-domain`。本地验证完成，远端构建和 Docker 运行检查以 PR 的 CI 状态为准。本次未合并、未发布生产，未切换 Cloudflare 跳转或关闭 self 站。

## Risks

域名迁移需要搜索系统重新处理信号，无法保证审核或收录。GSC 历史统计与实时抓取不能混同；有限事件窗口不能证明历史上没有拦截。
