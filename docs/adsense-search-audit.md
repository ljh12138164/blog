# AdSense 与搜索后台核查

核查时间：2026-10-17，约 19:50–20:15，北京时间。通过已登录的 AdSense、Search Console、Cloudflare 控制台只读查看；Wrangler 也已确认现有 OAuth 登录。未重提审核、请求编入索引、删除旧地图或更改线上安全规则。此记录保留结论与必要的聚合信息，不保存账号凭据、请求 IP 或原始日志。

## AdSense

- 站点为 `ljhboard.cn`，审批状态“需要注意”，详情“低价值内容”。
- “验证网站所有权”步骤显示对勾，当前选用 AdSense 代码段，发布商编号与仓库相符。该步骤完成不等于广告审批通过。
- 网站列表 ads.txt 显示“已授权”，后台最后更新时间为当日 10:52 CST。
- 复审按钮可用；本次没有点击。新静态脚本尚需发布后再次检查线上 HTML 与后台。

## Google Search Console

已存在 `sc-domain:ljhboard.cn` 网域资源和 `https://blog.ljhboard.cn/` 前缀资源。

### 站点地图

网域资源中，`https://ljhboard.cn/sitemap.xml` 显示“成功”，上次读取 2026-10-17，发现 47 个网页。blog 的 `/sitemap.xml` 显示“未知 / 无法抓取 / 0”；旧 `/sitemap-0.xml` 显示“无法抓取”，历史发现 39 个网页、最后读取 2026-08-26。

普通网络请求当日访问两个主机的 `/sitemap.xml` 均为 200、XML，但这不推翻 GSC 的历史失败。当前线上 sitemap 的正文地址与 canonical 仍使用 blog；本次代码将其统一到根域名。发布后在网域资源重新观察读取与 URL 归属。

### 代表性文章

| URL | Google 历史索引 | 实时测试与 canonical |
| --- | --- | --- |
| blog 主机 `/posts/nextra-blog-setup` | 已发现，尚未编入索引；来源包含旧 sitemap-0.xml，无抓取时间 | 19:59:18 Google 检查工具智能手机版抓取成功，允许抓取与索引，用户 canonical 为 blog 同路径 |
| blog 主机 `/posts/seo-geo-indexnow` | 已发现，尚未编入索引；没有报告引荐 sitemap，无抓取时间 | 20:02:35 同类工具抓取成功，允许抓取与索引，用户 canonical 为 blog 同路径 |
| blog 主机 `/posts/cloudflare-http3-early-hints` | 已发现，尚未编入索引；来源包含旧 sitemap-0.xml，无抓取时间 | 本次未做实时测试 |
| 根域名 `/posts/nextra-blog-setup` | Google 无法识别此网址；未报告 sitemap 或抓取时间 | 本次未做实时测试 |

上述历史记录的“查看被抓取的网页”不可用，Google 选择的 canonical 均不可用；不能声称已查看不存在的索引 HTML。前两个实时测试显示“要等到编入索引后才能确定”Google canonical，因此只能确认这两次实际抓取通过。

blog 前缀的网页报告更新于 2026-10-12：22 个已索引、50 个未索引。未索引包括 31 个已发现未索引、9 个已抓取未索引、7 个 404、2 个重复但未指定规范页、1 个重定向页。这些是 URL 统计，不等于“39 篇正文有 50 篇失败”；后续应逐项区分旧路径、正常重定向和重要正文。

## Cloudflare

查看范围为查询时过去 24 小时的 Security Analytics → Events 采样日志，筛选 `用户代理 contains Google`，分别加根域名与 blog 主机条件。

- 根域名：没有匹配的防火墙事件。
- blog：一条命中托管规则的记录，方法 POST、路径 `/admin`，用户代理自称 Googlebot，规则为 React RCE CVE-2025-55182。它不是文章或 sitemap 的 GET；Google Cloud ASN 和用户代理也不足以确认真实 Google 搜索爬虫身份。
- 全区域存在其他相同类型记录，不能拿其他工具子域名的攻击探测解释博客未索引。
- 规则概览中根域名、www 到 blog 的旧跳转禁用。用户明确保留根域名与 blog 直接访问，不启用两者之间的跳转。
- 安全设置中 Bot Fight 模式与 AI 迷宫开关均未启用；托管防护仍启用。没有因本次排查改变这些状态。

结论：本次未发现正常文章或地图抓取被 WAF 拦截的证据，且 Google 两次实际测试通过。有限时间范围、采样和用户代理筛选仍无法排除更早失败、其他代理名称或源站错误；尤其不等同于验证 AdSense 专用爬虫的完整历史。没有据此关闭 WAF 或添加按 UA 放行规则。

## 发布后的验收

发布后分别验证根域名与 blog 的 HTML、作者资料、AdSense 脚本、ads.txt、sitemap 均直接可用，canonical 与 sitemap 正文统一为根域名，不配置 blog 跳转。随后复查根域名代表文章的 Google 实时抓取、历史索引和 Google canonical，确认新 sitemap 继续成功；最后结合实际内容修订决定是否申请 AdSense 复审。self 资料迁移的入口安排独立处理。

参见 [部署顺序](deployment.md)、[开发与验证记录](development/adsense-trust-domain.md)。

## 2026-10-18 同意管理与双域名复核

核查时间约 00:00–00:08，北京时间。只读查看，没有切换开关、保存消息或重提网站审核。

AdSense 的欧洲法规嵌入页持续加载，直接打开该页面已经提供的详情入口后，成功读到消息列表与设置：

- 名称为 `European regulations message - ljhboard.cn`，网站列为 `ljhboard.cn`。
- 状态为“已发布”，发布开关开启，上次修改日期为 2026-08-25。
- 默认英语，另外 31 种语言；概览为 1 条有效消息。默认统计视图显示次数 0、同意率 0%，不能据此否认其已发布状态或推断故障原因。
- “允许 Google 最大限度地扩大消息覆盖范围”已开启。
- **“为广告用途启用意见征求模式”未勾选**。分析用途子选项在广告用途关闭时未显示；没有将它说成已启用。仓库中的 GA 初始化也没有发现独立的默认拒绝与更新联动。
- 没有改动合法权益、合作伙伴、覆盖范围或其他隐私设置；保存与撤消按钮均处于不可用状态。

已有消息不等于 GA 已接收同意信号。Google 提供广告用途和分析用途两项 Consent Mode 设置；若决定使用现有 Google CMP 联动 GA，需要结合默认状态与加载时序一起验证，不能只把后台复选框当作端到端合规证明。参见 [Google：管理意见征求模式](https://support.google.com/adsense/answer/16053245?hl=en)。

消息编辑内容未加载完成，尚未核实隐私链接与拒绝按钮。依据 [Google 官方测试说明](https://support.google.com/adsense/answer/10924669?hl=en#test-your-messages)，尝试通过 `?fc=alwaysshow&fctype=gdpr` 预览根域名消息，但浏览器导航超时，未得到可判断的页面结果；没有完成真实 EEA 地区或接受/拒绝后的请求测试。消息列表绑定根域名也不足以证明本次已验证 blog 子域名的显示行为。

双域名普通请求的结果：两个首页均为 200，canonical 都指向 `https://blog.ljhboard.cn`；blog 的 Umami 文章为 200、canonical 为 blog 同路径。根域名该文章的一次复核请求超时，这不是已确认的站点故障，前一轮 39 篇检查的成功结果也不能替代当前这次失败。根域名 robots 仍禁止 `/_next/`，Host/Sitemap 仍为 blog。两个域名能访问与迁移尚未完成可以同时成立；本次没有修改 DNS、跳转或 robots。

再次打开 Cloudflare 的实际规则确认：两条单一重定向均禁用，旧根域名规则的目标实际为 blog；页面规则只有图片域名缓存，没有启用的正文跳转。应按“双入口提供同一内容”处理，不能再描述成根域名仅有 301。本次未保存控制台规则。此前文档擅自增加的 blog 301 方案已按用户纠正撤除，双域名通过同一 sitemap 与 canonical 支持，见[部署说明](deployment.md#两个域名直接访问与-sitemap)。

## 2026-10-18 03:39 CST 同意联动修复

用户要求修复并完整验证 GA 同意行为。网络恢复后，在现有 Google CMP 设置中保存启用广告用途与数据分析用途的意见征求模式；保存后两项仍为勾选，保存按钮禁用。未修改供应商、合法权益、设备指纹用途或消息覆盖范围。该设置为账号级联动，当前消息列表只有一条已发布的根域名消息。

Tag Assistant 已成功连接当前线上根域名并识别 `G-CNJ6XX4XBJ`，但 Config 事件仍显示“未配置用户意见征求 / 尚未设置默认同意情况”；该版本尚未部署修复分支。两域名强制预览仍未显示 CMP 消息，后台编辑器遇到内部 EventBus 加载错误。接受、拒绝、回访恢复与撤回均未验证通过，不将后台开关保存替代端到端验收，也不推断为地区或站点审核导致。详见[本轮开发与验收记录](development/adsense-consent-crawl.md)。没有重新提交 AdSense 审核。
