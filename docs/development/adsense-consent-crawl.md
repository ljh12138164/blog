# AdSense：内容数字、静态资源抓取与 GA 同意

> 以下为 PR #30 合并前的开发与验证记录。2026-10-18 用户允许合并发布后，该 PR 已上线；两域名默认拒绝已通过真实 Tag Assistant 验证。随后发现提前执行原生 AdSense 会触发 hydration 重建，修复与当前 CMP 验收状态见 [GA 发布回归](ga-production-validation.md)。下文“待发布”“保留草稿”及原生脚本方案不再代表当前状态。

## Background

PR #29 已合并。用户要求删除无法确认的数字，允许页面 CSS/JS 抓取，并完整验证 GA 是否遵循同意选择。

## Scope

- 删除旧项目文章中无报告或可复现条件的体积、跑分、耗时和降幅，不补造实测材料；同步相关标题与摘要。
- robots 允许 Next.js 静态资源，保留搜索索引文件的抓取限制。
- 复用已发布的 Google CMP，补齐 Google 标签的同步默认同意状态与加载顺序，并验证接受、拒绝和再次访问。

## Out of scope

修改域名跳转、重建下线项目、新增自制广告 CMP、自动申请复审或发布生产。两域名继续直接访问，canonical/sitemap 仍统一根域名。

## Acceptance criteria

- 无依据的测量数字不再出现在正文和公开摘要中；示例代码参数、HTTP 状态码和版本号保留。
- 导出 robots 允许实际引用的 CSS/JS，sitemap 仍使用根域名。
- 同意默认值在广告脚本、GA config 和异步 CMP 更新之前同步建立；不能因等待超时自动视为同意。
- 明确区分本地静态/运行验证、后台设置核实与线上真实 CMP 端到端结果，无法访问不记为通过。
- 类型检查、构建、相关测试与最终差异审阅通过后创建新 PR。

## Feasibility

代码修复可行：Next.js 静态导出、原生 AdSense head 脚本与集中式 GA 初始化均已有入口，不需要依赖或新页面。复用 PR #29 的双入口与页面归属决策，无新增界面设计。

Google 文档要求 consent default 同步早于测量命令，且现有 Google CMP 提供广告与分析用途的 Consent Mode 联动。后台配置与实际用户选择属于独立外部环节，需要真实浏览器核实；不能将手工模拟 update 当成 Google CMP 测试。

## Implementation

9 篇文章删除无法复核的测量、收益百分比和固定体积/冷启动数字；保留实现步骤与代码参数，修正把 Yjs 状态编码直接说成固定压缩收益的句子。协同笔记标题和设计平台摘要同步到 Open Graph、Twitter、RSS 与 llms 输出，不补造报告。

删除各 robots policy 对 `/_next/` 的限制，保留 `/_pagefind/`。没有调整域名、canonical 或 sitemap 正文地址。

在 head 中同步输出 `google-consent-default`，四项 Google Consent Mode v2 状态均为 denied，等待异步更新 500ms；超时后仍保持 denied。保留高级模式，GA 可以发送无 Cookie 信号，不宣称拒绝后零请求。默认值不使用地域推断，没有 CMP 有效更新时所有地区都维持拒绝 Cookie，同一访客识别与回访统计可能减少。

实测 React 19 将原生 async AdSense 提前到默认脚本之前，回归测试拒绝了第一版。用一个小型客户端 `AdSenseScript` 组件保留标准 async、crossOrigin 和 Rocket Loader 排除属性，通过 onError 诊断处理禁用 React 的脚本提升；导出 HTML 仍有且仅有一份原生 AdSense head 标签，不靠 hydration 才插入。GA 初始化沿用同步建立的 gtag 队列，避免覆盖 CMP 的入口。没有自己解析 TCF 用途来猜测 analytics_storage。

参考 [Google 同意初始化](https://developers.google.com/tag-platform/security/guides/consent)、[Google CMP 联动设置](https://support.google.com/adsense/answer/16053245)、[Google CMP API](https://developers.google.com/funding-choices/fc-api-docs#using_google_consent_management_solutions_with_consent_mode_support_for_eu_regulations)、[Tag Assistant 验证](https://developers.google.com/tag-platform/security/guides/consent-debugging)、[React 脚本提升](https://react.dev/reference/react-dom/components/script)。Google CMP 文档明确：开启后台联动即支持高级模式，不需要额外自行转译 TCF。

## Verification

- `pnpm typecheck`、`pnpm build`、`pnpm test` 通过；12 个测试文件、32 项检查。Biome 检查通过。
- `scripts/google-consent.test.mjs` 先在旧产物上因缺失默认值失败，再捕获 React 提升导致的倒序；最终对全部 49 个导出 HTML 验证默认拒绝的实际脚本执行、同步属性与 AdSense 相对顺序。新增 CI 构建后检查。
- 静态产物齐全：index.html、Pagefind、sitemap、robots；canonical 校验通过。主页面 default 标签仅一份，在原生 AdSense 之前；AdSense 仅一份。
- 本地静态服务分别以两个 Host 请求首页，均 200、根域名 canonical，每种 Host 所引用的 12 个 CSS/JS 均返回 200。此检查是本地产物，不是线上域名发布结果。
- 早先本地浏览器预览被 ERR_BLOCKED_BY_CLIENT 拦截；用户告知网络恢复后，03:41 CST 新建 Chrome 页面成功访问 `http://127.0.0.1:3012/`。浏览器 DOM 中存在同步默认脚本、hydration 后插入的 GA config 与外部 gtag.js；控制台未报告 hydration 错误。Tag Assistant 连接本地地址超时，不能用 DOM 存在代替 GA 运行状态验证。
- 2026-10-18 约 03:39 CST：AdSense 连接恢复。已保存启用“为广告用途启用意见征求模式”和“为数据分析用途启用意见征求模式”；保存后两项仍勾选，保存/撤消按钮禁用。该设置属于账号级 Google CMP 配置；当前消息列表仅一条已发布的根域名消息。没有改合作伙伴、合法权益、设备指纹用途、覆盖范围或提交网站复审。
- Tag Assistant 成功连接当前线上根域名，识别 `G-CNJ6XX4XBJ`；其 Config 事件显示“未配置用户意见征求 / 尚未设置默认同意情况”。这是尚未部署本分支的旧版本，不能声称新代码已在线通过。
- 根域名与 blog 的 `?fc=alwaysshow&fctype=gdpr` 均能显示站点，但未出现 CMP 弹窗。后台消息为已发布；完整后台嵌入编辑器仍停在加载，控制台报告 Google 内部 EventBus 错误。未得到拒绝按钮、隐私链接或真实用户选择结果，不推断为审核状态或地域导致，也不把强制预览当作真实地区验收。

### 尚未完成的端到端验收

广告与分析用途的 Consent Mode 联动已保存；仍需消息编辑器恢复后核实拒绝选项、隐私链接和重新管理选择的入口，并验证实际消息。

代码发布后，分别在根域名和 blog 使用 Tag Assistant 与干净的测试会话，验证：

| 场景 | 预期 | 当前结果 |
| --- | --- | --- |
| 首次访问、尚未选择 | 四项默认 denied，早于 config；等待超时不自动 grant | 导出代码通过；线上待发布和验证 |
| 接受分析用途 | analytics_storage 随实际选择更新，广告用途不因分析同意被一并猜测授予 | 未验证 |
| 拒绝全部 | 四项维持/更新为 denied；不因“仍有请求”直接判为失败，需要区分无 Cookie 信号 | 未验证 |
| 拒绝后刷新/进入文章 | CMP 恢复拒绝；不短暂切换 granted | 未验证 |
| 接受后再次访问、撤回选择 | CMP 恢复相应同意；撤回后更新 denied | 未验证 |

不把两个域名的选择强制共享，不据根域名一次通过推断 blog 已通过。两端都应在适用地区验证真实消息，强制预览不等于真实地区测试。

## Review

已复核脚本时序、四项默认值、队列保留、静态标签完整性、robots 与同域名约定。未增加依赖、定时任务或新的 CMP；正文只处理无依据数字和直接关联的承诺。代码检查与后台联动保存完成。真实接受/拒绝验证仍属本任务的阻断项，不能以 roadmap 后续事项掩盖或声称已完整完成；PR 应保留草稿状态。无其他接受的后续项。

## Risks

默认拒绝只提供安全初始状态，不能替代 CMP 的用户选择与更新。源码和本地测试通过不代表后台开关或两域名线上已生效，不保证 AdSense 内容审核结果。
