# AdSense、作者资料与正式域名迁移

## Background

AdSense 将 ljhboard.cn 标记为低价值内容。2026-10-17 后台 ads.txt 显示已授权，所有权区域选用代码段。根域名和 blog 均能返回博客 HTML，但 canonical 仍为 blog。

## Scope

- AdSense 在 head 中输出原生 async script，保留验证 meta，避免 Rocket Loader 改写该脚本。
- 正式 URL 改为 https://ljhboard.cn，同步作者、结构化数据、生成文件、部署校验与运维文档。
- self 站的作者、作品、技术方向迁入 /about，补编辑、纠错、引用与技术使用说明；隐私页同步实际服务。
- 打磨建站与 SEO 文章，补版本、仓库链接、可运行检查和适用边界。
- 只读核查 AdSense、GSC 代表文章和 Cloudflare 安全事件，记录时间范围与证据局限。

## Out of scope

自动申请 AdSense 复审、购买流量、编造经历或测量、修改独立工具站、未经发布验证就关闭 self 或跳转旧博客。

## Acceptance criteria

- 导出 HTML 在 head 中仅有一份正确的 AdSense 外链脚本，meta 与 ads.txt 保留。
- canonical / og:url、sitemap、RSS、robots 指向根域名，部署校验同步。
- /about 包含联系方式、作品、可追溯贡献、编辑与纠错说明；不新增页面或 UI 依赖。
- 两篇代表文章补可核查依据，不把待发布内容说成已上线。
- typecheck、生产构建、相关测试通过；明确后台验证局限。

## Feasibility

可行。Next.js 16.0.7、React 19.1.0、Nextra 4.6.1、Tailwind 4.3.3，纯静态导出。site.config.json 是域名来源；部署 canonical 断言需同步，否则新版本健康检查失败。

根域名已提供 HTML，边缘根域名到 blog 的旧重定向处于禁用状态。blog 到根域名、self 到 /about 的跳转在新内容上线验证后切换，避免环路与丢失旧路径。源站 ai 域名及证书路径属于现有回源链路，不能机械替换。

## Implementation

复用 `docs/superpowers/specs/2026-09-01-personal-tech-notebook-ui-design.md` 已确认方向：现有 /about、/privacy 与文章继承 MDX / Article 窄栏排版，桌面、平板和 390px 手机；普通文档与链接，无新增交互状态。已加载 UI Skills `dammyjay93/interface-design`、`ibelick/baseline-ui`。复用系统字体、teal 强调色、表面色差与 4px 间距节奏。

作者资料依据 self 站和 GitHub 公开记录，贡献直接链接 PR，不用项目 star 数证明个人贡献。采用 ponytail 最小改动原则，不加依赖。

建站文章改正版本、容器端口与浮动包管理器示例，固定代码证据到基线提交；SEO 文章增加真实 GSC 观察，删除未提供图片的截图占位，修正已存在 Article image 的描述。保留原始发布日期，在正文标明核对时间，不编造性能采样。

部署检查正常发布仅接受根域名，首次迁移回滚允许旧 blog canonical。未改源站 ai 的证书、回源、服务器配置或线上 Cloudflare 规则。

## Verification

- `pnpm typecheck` 通过。
- `pnpm build` 通过：39 篇文章、Pagefind 41 页、单一 sitemap，全部导出 HTML 的根域名 canonical 与静态 AdSense 断言通过。文章示例修订后再次构建验证。
- `pnpm test:unit` 9 文件 / 25 项、`pnpm test:resource-hints` 1 项通过。
- 对改动的 TS/JS/JSON 执行 Biome 检查与格式化通过；无依赖或无关格式调整。
- Git Bash 对 `deploy/server/deploy-blog` 执行 `bash -n` 通过；隔离 curl 的健康检查验证：新 root 接受，旧 blog 在正常发布拒绝、回滚接受，外部域名拒绝。默认 WSL bash 不可用，改用系统已安装 Git Bash。
- 删除导出首页 AdSense script 的受控负向检查被 `verify:seo` 正确拒绝，随后原样恢复并再次校验通过。
- Chrome 本地预览检查 /about、/privacy、两篇文章。桌面与 390px 手机视口检查作者/隐私页；作者页及建站文章手机根节点无水平溢出。未新增交互或样式；本地 `/stats/` 404 属于未经过 Nginx 统计代理的开发环境，生产代理不在本次修改范围。
- 后台实证见 [AdSense 与搜索核查](../adsense-search-audit.md)。未提交复审或更改线上规则。

## Review

按仓库规范与本文件验收逐项审阅：已解决首次迁移回滚 canonical 不兼容、教程过时配置、截图占位与无依据镜像体积。无未解决的代码阻断项。

接受的后续工作为生产迁移和搜索系统观察，以及依据具体失败 URL 继续处理历史索引问题；顺序与完成信号见 [roadmap](../roadmaps/adsense-trust-domain.md)。拒绝按 Googlebot 用户代理全站放行、复制双站点作为长期主站、以固定流量或天数承诺过审：本次证据不支持。

## Delivery

已创建 [PR #29](https://github.com/ljh12138164/blog/pull/29)，分支 `feat/adsense-trust-domain`。本地验证完成，远端构建和 Docker 运行检查以 PR 的 CI 状态为准。本次未合并、未发布生产，未切换 Cloudflare 跳转或关闭 self 站。

## Risks

域名迁移需要搜索系统重新处理信号，无法保证审核或收录。GSC 历史统计与实时抓取不能混同；有限事件窗口不能证明历史上没有拦截。
