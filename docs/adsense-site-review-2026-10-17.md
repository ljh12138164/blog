# AdSense 全站审查：2026-10-17

本次是只读审查，没有修改文章、广告投放或 Cloudflare 规则，没有发布或申请复审。代码基线为 PR #29 的 `d3ec2cf7bf47dfb6d9ac3ee908a41dfe534c2f37`。线上 HTTP 与后台复核时间为当晚约 23:30–23:52，北京时间；GSC 与 Cloudflare 的部分证据来自当日较早的[后台核查记录](adsense-search-audit.md)，不冒充本次重新查询。

结论：尚不建议直接勾选“已解决”申请复审。没有发现明显的色情、赌博、诱导点击等内容，但存在文章准确性与一手证据不足、线上隐私披露不完整，以及抓取资源限制。PR 中的修复尚未发布，不能计入线上已解决。以下发现不是对 Google 拒审算法的反推，也不代表 Google 已逐项认定违规。

## 范围与结果

| 检查范围 | 结果与限制 |
| --- | --- |
| 39 篇线上文章 | 逐 URL 普通 HTTPS 请求均为 200；原始 HTML 有 main，未发现 noindex；canonical 全部仍指向 blog 主机。同一网络出口的普通请求不能代替 Google 抓取。 |
| 本地 49 个导出 HTML | 检查 href/src 指向的本地文件和页面。唯一不在导出目录的引用是 `/stats/script.js`，它由 `deploy/host-nginx.conf` 的 `/stats/` 代理提供；未发现其他缺失的本地引用。这不是对所有外链、锚点或图片视觉效果的完整验证。 |
| 首页、关于、隐私、专题、地图、robots、ads.txt、无效地址 | 线上根域名已经直接返回首页；不存在本次所谓“根域名只有 301”的现象。不存在的地址返回真实 404，且 noindex。 |
| 内容 | 对全部 39 篇做文本与链接扫描；重点阅读 Umami、Jebet 优化、设计平台优化、React 时序，核对 Early Hints、协同、建站与 SEO 文章。没有声称逐句复现全部教程、核实全部版权或完成全网查重。 |
| AdSense | 站点仍为“需要注意 / 低价值内容”，ads.txt 为“已授权”，最后更新时间显示 10 月 17 日 10:52 CST。欧洲法规概览显示“1 条有效消息”。消息详情未能加载，不能确认其绑定域名与地区实际行为。自动广告页未显示可供核验的站点配置行。 |
| CI | 该代码提交的 CI and Deploy，run #114，结果 success。CI 成功不等于 PR 已部署到生产，也不等于符合广告政策。 |

## 1. 优先处理：实战文章的关键结果缺少可复核依据

这是最贴近本次“低价值内容”的内容质量风险，不能靠新增关于页或润色口气解决。Google 强调相对于其他站点的独特价值、原创贡献和读者再次访问的理由，未承诺文章多或篇幅长即可通过。[内容和用户体验](https://support.google.com/adsense/answer/10015918?hl=en)

具体例子：

- `app/posts/jebet-optimization/page.mdx:138` 的对比表给出构建体积 7.2 MB → 1.15 MB、FCP 6.2 秒 → 0.8 秒、Lighthouse 38 → 95。正文没有关联的项目提交、测试设备、网络配置、采样方法或原始报告。
- `app/posts/design-optimization/page.mdx:128` 给出 JS 2.65 MB → 410 KB、LCP 3.8 秒 → 0.9 秒、Lighthouse 49 → 98，同样缺少测试条件与报告。
- 同类线索还包括 `custom-form-optimization` 的 100 字段输入延迟 120 ms → 8 ms，以及 `collaborative-note-optimization` 的 Lighthouse 58 → 96。它们应作为下一批核实对象，而非已经判定造假。

建议先完善这几篇：给出真实项目/可公开的最小复现、依赖版本、前后提交、实际命令、测试环境、测量报告、失败方案与适用边界。项目无法公开时，可提供脱敏复现与脱敏报告。无法确认的数字应删除或明确标为示例，不补造证据。这一发现说明读者目前难以验证结果，不证明作者没有做过这些工作。

PR 已补强的建站与 SEO 文章可作为写作参照：能追溯到固定提交、命令与实际 GSC 观察，并明确未测量的结果。Early Hints 文章也有实际响应截图、分层验收和故障判断。

## 2. 优先处理：教程有事实错误和没有兑现的内容承诺

这些是具体编辑质量问题，不自动构成 Google 对有害虚假信息的政策认定。

| 位置 | 发现 | 建议 |
| --- | --- | --- |
| `app/posts/umami-vercel-supabase/page.mdx:42` | 称 GA4“依赖第三方 Cookie”。官方说明 GA4 JavaScript 使用第一方 Cookie。 | 改正事实；是否需要同意要按地区、用途和实际实现判断，不能由第一方/第三方标签简单推出。 |
| 同文第 27 行及 description | 承诺 Next.js App Router SPA 统计与自定义事件埋点，正文接入部分只给出通用 HTML script。 | 补上实际 Next.js 配置、路由切换和事件验证，或收窄标题摘要承诺。 |
| 同文第 45 行 | “长期稳定的零成本”表述过满，虽文末提到暂停限制，仍未交代所用版本和免费方案核对日期。 | 按实际部署说明用量边界、暂停/唤醒和成本变化，避免长期保证。 |
| `app/posts/design-optimization/page.mdx:109` | 示例含 `swcMinify: true`，没有标明旧版本边界；该配置已在 Next.js 15 移除。 | 给出原项目版本，并提供当前版本的适用说明。 |
| `app/posts/react-execution-order/page.mdx:112` | 把父子渲染解释为父组件调用 `Child()`，容易误导读者直接调用组件函数。 | 解释 JSX 创建元素、React 调用组件；补 React 版本、StrictMode 与可运行日志示例。 |

核对依据：[GA4 Cookie 使用](https://support.google.com/analytics/answer/11397207?hl=en)、[Next.js Compiler](https://nextjs.org/docs/architecture/nextjs-compiler)、[React 调用组件与 Hook](https://react.dev/reference/rules/react-calls-components-and-hooks)。

## 3. 线上合规缺口：隐私页没有完整解释实际统计服务

线上 `/privacy` 已有 AdSense、广告 Cookie、退出个性化广告等说明，因此不能称“没有隐私政策”。但线上首页 HTML 包含 Google Analytics、Umami 和百度统计的加载配置，旧隐私页未说明这些统计服务及其数据用途。单独写服务器日志和广告 Cookie，不能充分解释实际的收集链路。

Google 要求隐私政策清楚披露因使用 Google 服务发生的数据收集、分享、用途及相关技术。应让披露与实际加载的服务一致；其他第三方的说明也应一并核实。[隐私披露政策](https://support.google.com/adsense/answer/10502938?hl=en#privacy-disclosures)

PR 的 `app/privacy/page.mdx:39` 已补充 Cloudflare、Google Analytics、Umami、百度及其政策链接，第 69 行也补充 Giscus；但目前生产页仍是旧版，尚不能算完成。发布后应再次核对实际服务清单。

### 同意管理：存在配置，仍缺运行验证

本次 AdSense“隐私权和消息”概览明确显示欧洲法规“1 条有效消息”，所以不能因为源码没有独立 CMP 片段，就断言未配置 CMP。Google 自身的欧洲法规消息可以承担认证 CMP 功能。

仍待核实：消息是否绑定 `ljhboard.cn`、隐私链接是否更新、EEA/英国/瑞士访问时的展示、接受/拒绝后的广告与统计行为。`app/layout.tsx:152` 直接配置 GA，仓库未看到默认拒绝/同意更新的联动；后台消息的存在也不能替代这些运行验证。

Google 对这些地区的个性化广告要求认证且集成 TCF 的 CMP；不能将其简化成“无 CMP 的所有广告一律违法”或“中国浏览器没弹窗就是违规”。[当前 CMP 要求](https://support.google.com/adsense/answer/13554116?hl=en)

## 4. 抓取与迁移问题：资源被 robots 排除，线上仍声明旧域名

### 4.1 允许抓取必要的 CSS 和 JavaScript

`next-sitemap.config.cjs:44` 对通配爬虫禁止 `/_next/`。该目录实际承载页面的 CSS 和 JS。线上 robots 也有相同限制；从线上 HTML 取到的真实 CSS 与两个 JS 地址普通访问均为 200，但仍匹配这条 robots 排除规则。200 与允许爬虫渲染是不同检查。

应允许 Googlebot 获取页面渲染资源，并用 GSC 的实际渲染结果验证。原始文章已在静态 HTML 中，不能夸大为“Google 完全看不到文章”。[Google 的 JavaScript 抓取排错说明](https://developers.google.com/search/docs/crawling-indexing/javascript/fix-search-javascript)

这是搜索渲染风险，不是已证实的 AdSense 抓取封禁。Google 明确区分搜索与广告爬虫，且 AdSense 对通配 robots 规则有其特定行为；应单独检查 `Mediapartners-Google`、`Google-Display-Ads-Bot` 的访问证据。[AdSense 爬虫说明](https://support.google.com/adsense/answer/99376?hl=en)

### 4.2 完成正式域名切换，再复核索引

根域名与 blog 首页目前均可访问；39 篇根域名文章 canonical 全部仍声明 blog 地址，线上 sitemap/robots 的地图地址也仍采用 blog。相对于用户确定使用根域名的目标，这是尚未完成的迁移。双主机本身不等于 doorway、欺骗或政策违规，301 也不是天然拒审原因。

PR 已生成根域名 canonical 与 sitemap，需按[部署顺序](deployment.md)发布并验收，再设置旧主机逐路径永久跳转。不要为了审核临时让两个域名各自声明 canonical。

当日较早的 GSC 检查中，两篇 blog 文章历史状态为“已发现，尚未编入索引”，但实时测试成功，Google 选择的 canonical 尚不可用。不能将自己的 200、实时测试成功或提交 sitemap 当作已收录。发布后应检查根域名代表文章的历史索引、实时渲染与 Google canonical，详见[后台核查记录](adsense-search-audit.md)。

## 5. 投放前的条件风险：非内容页面与广告位置

`app/layout.tsx:146` 全局加载 AdSense，包括 404。代码中没有手工广告单元；后台自动广告页本次没有可供核验的站点行，也没有观察到 404 上实际展示广告。因此不能把“带有加载脚本”直接写成“已在错误页违规投放”。

正式投放前应排除 404、站内搜索空结果等缺少实质内容的界面，检查移动端广告是否遮挡导航、正文或形成误触。关于页本身有原创个人资料与项目内容，不需要为了广告机械补长；隐私页等功能页面也无需强行变成文章。[无发布商内容页面广告政策](https://support.google.com/publisherpolicies/answer/11112688?hl=en)

## 已确认的正面结果与不能下的结论

- ads.txt 的线上内容与发布商编号一致，后台为“已授权”；此前记录的网站所有权步骤完成。它们不等于广告审批通过。
- 文章静态直出，有分类、专题、搜索、日期、作者页入口和联系方式。作者介绍位于文章底部，不能说文章完全没有署名。
- PR 已有完整个人站迁入的关于页、项目和实际公开 PR 链接、技术栈图标及隐私说明；无需添加未经证实的履历、奖项或长篇免责声明来“补 E-E-A-T”。
- 文本扫描和抽查未发现明显受禁止主题、诱导广告点击或空白文章；未完成全部代码运行、全网查重和每张图片的授权核验，不能保证绝对无侵权或全部事实正确。
- 当日较早的 Cloudflare 采样日志没有证明正常文章/地图 GET 被拦；两次 Google 实时测试通过。自称 Googlebot 的 `/admin` 攻击 POST 不足以归因于 Google。未获得源站完整访问历史，也未验证所有 AdSense 专用爬虫请求，不能据此保证“完全没有拦截”。
- 本次核对的官方页面未给出可据以承诺过审的固定字数、文章数、日访问数或等待天数。站点通知确实关注用户热度与持续价值，但不能编造“每天几十到上百访问即可通过”或“等 7–14 天就行”的门槛。

## 建议顺序与验收

1. 修正文中可确认的错误；优先给四篇优化实战补真实证据，对没有依据的精确指标做诚实处理；让 Umami 教程的正文覆盖摘要承诺。
2. 放开必要的 Next.js 渲染资源；完成 PR 发布、根域名 canonical/sitemap 与旧域名跳转的一致性验收，确认新版关于页与隐私页已在线。
3. 验证已有欧洲法规消息的域名绑定与地区运行效果，并核对广告和统计同意行为；确认非内容页排除和移动端广告体验。
4. 在 GSC 检查代表性正文和资源渲染，结合真实 Google 请求与源站/Cloudflare 记录排除访问问题。按后台实际状态判断是否复审，不以固定等待时间代替验收。

这些动作能解决本次审查的具体问题，不能保证 Google 的审核结果。广告政策、内容价值、索引与流量是相关但不同的检查项。

## 2026-10-18 后续处理

用户说明此前项目已经下线，本轮不恢复项目、不补造报告，也不修改其他实战文章。项目下线不能直接视为 AdSense 违规；原审查中“缺少可复核测量材料”的风险保留，不再把恢复旧项目作为本轮交付条件。

按用户要求，仅修正 Umami 文章的现有错误与表述，不新增 Next.js 集成或事件教程：改正 GA4 Cookie、共享连接池及免费方案的说明；撤回未覆盖的 SPA/事件承诺、固定部署耗时与长期零成本保证；同步摘要，保留章节、四张图片和 HTML 脚本示例。类型检查、生产构建与导出检查通过。这些修订尚在 PR，不能说线上文章已经更新。

同意管理新增实证：消息绑定 `ljhboard.cn`，已发布；广告用途 Consent Mode 关闭，分析用途选项尚未显示。详情与运行验证的局限见[后续后台核查](adsense-search-audit.md#2026-10-18-同意管理与双域名复核)。没有更改后台隐私设置。
