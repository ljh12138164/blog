# GA 发布回归与 AdSense hydration 修复

## Background

用户要求完整验证 GA 是否遵循真实同意选择，并允许合并发布 PR #30。该 PR 已合并为 `fee4bde7f02b563779977ec9f9bc9623270f7229`，生产流水线 [#121](https://github.com/ljh12138164/blog/actions/runs/39070579514) 的 verify 和 deploy 均成功。

## Scope

验证两域名线上默认同意、静态资源和 robots，排除回归时发现的脚本重复，继续重试现有 Google CMP 的真实选择。

## Out of scope

不改域名、DNS、跳转、canonical/sitemap 约定；不新建 CMP，不模拟 consent update，不自动提交复审或发布本修复。

## Acceptance criteria

- 页面默认同意在 GA/AdSense 前同步建立，四项 denied，等待超时不自动授予。
- 完整 reload 后仅一份默认脚本、一份 AdSense 加载脚本，控制台无 hydration mismatch。
- 导出 HTML 保留 Google 官方支持的网站验证 meta；浏览器仍实际加载 AdSense。
- 接受、拒绝、恢复、撤回必须通过真实 CMP 验证，受阻明确记录，不能以默认拒绝代替。

## Feasibility

可行。沿用 PR #30 的同意模式和双域名决策，无新页面、依赖或界面设计。Next.js 16.0.7 已使用 `next/script` 的 afterInteractive 管理 GA 等脚本，可复用管理 AdSense。

本地 dev 错误给出确切节点差异：Google `show_ads_impl` 插入 head 后，React 在期望 `google-consent-default` 的位置遇到 Google 外部脚本；整树重建，默认和 AdSense 标签各变成两份。静态 HTML 各一份不能覆盖此时序问题。通过 hydration 后加载 AdSense 消除抢先修改 head 的触发条件；改用已有 `google-adsense-account` meta 保持静态验证，属于 [Google 支持的验证方法](https://support.google.com/adsense/answer/7584263?hl=en)。不再要求原生可执行 AdSense 标签在 hydration 前运行。

## Implementation

以已有 Next Script afterInteractive 替换提前执行的原生 AdSense 客户端组件，删除该组件；保留同步 default 和验证 meta。更新静态回归的验收目标，浏览器回归负责检测真实加载与标签重复。async、crossOrigin 和 data-cfasync 保留，GA 与 CMP 的同意更新逻辑未改。

## Verification

- 生产两个域名首页和代表文章均直接 200；robots、sitemap、ads.txt 正常；首页实际引用的 12 个 CSS/JS 全部 200。
- root robots 命中旧 Cloudflare 缓存；仅清除 `https://ljhboard.cn/robots.txt` 后正式 URL 已允许 /_next/。未调整任何域名、安全或缓存规则。
- Tag Assistant 在两域名 Config 和窗口加载事件中四项默认/当前均为 denied，更新为空。blog 真实 page_view 的 dl 为 blog 域名，gcs=G100。
- 原始复现：在 CUA 中执行 `gaHydrationCheck(gaRetryLocalDirect)`，reload 后实际 DOM 为 defaults=2、ads=2，抛出 Hydration regression；dev 3013 显示同一 hydration 节点差异。静态 SSR 测试仍通过，说明运行回归不可省略。
- Google CMP 已发布，广告与分析联动均已保存；强制预览未出现消息。后台先反复卡在加载，约 05:45 CST 完整后台的编辑器终于可用。关联网站只有原根域名；隐私政策 URL 错误指向 `http://ljhboard.cn`，已通过网站信息对话框保存为 `https://ljhboard.cn/privacy`。未调整其他同意选项或发布新消息。后台管理步骤预览有 Confirm choices 和撤回链接步骤，但不能当作站点真实选择；接受/拒绝/恢复/撤回仍未验证。
- 修复后原始 `gaHydrationCheck(gaRetryLocalDirect)` 通过：defaults=1、ads=1。全新静态预览页面也为各一份，AdSense 的 async/crossOrigin/data-cfasync 属性正确，show_ads_impl 已实际插入，控制台无错误。不是通过屏蔽 Google 脚本使复现消失。
- 新静态测试在旧产物上因提前执行 AdSense 失败；重新构建后全部 49 个 HTML 通过。`pnpm build`（含 SEO、Pagefind、sitemap）、`pnpm typecheck`、`pnpm test` 均通过，12 个测试文件/32 项检查。
- 生产 blog 代表文章的 Config 事件同样四项默认和当前 denied，更新为空；default 事件早于 Config。
- 修复后的本地生产产物再次通过真实 Tag Assistant：Config 的四项默认/当前均 denied，default 事件先于 Config；没有手工模拟 consent update。
- 隐私政策 URL 关闭重开编辑器后仍为 `/privacy`，确认已保存。AdSense 网站详情为“需要注意/低价值内容”，ads.txt 显示“已授权”；所有权面板仅展示验证方式，不补写不存在的独立成功标记。后台恢复后，两域名 `fc=alwaysshow&fctype=gdpr` 再试仍无 CMP 弹窗与 Funding Choices 脚本。

修复 PR：[#31](https://github.com/ljh12138164/blog/pull/31)，代码提交 `2836dfe`，尚未合并发布。CI 从 [#122](https://github.com/ljh12138164/blog/actions/runs/39072494786) 开始，最新检查以 PR 为准。

### 浏览器复现入口

以 CUA 打开本地静态 out 服务后，运行以下检查。它同时用于修复前后，不能只检查导出 HTML：

```js
await tab.reload()
await tab.playwright.waitForLoadState({ state: 'networkidle', timeoutMs: 15000 })
await tab.getAXState({ emit: false })
const counts = await tab.playwright.evaluate(() => ({
  defaults: document.querySelectorAll('#google-consent-default').length,
  ads: document.querySelectorAll('script[src*="adsbygoogle.js"]').length
}))
if (counts.defaults !== 1 || counts.ads !== 1) {
  throw new Error('Hydration regression: expected one consent default and one AdSense script')
}
```

另用全新页面读取 `tab.dev.logs`，排除旧错误累积；确认 Google 托管脚本已出现。该真实第三方时序依赖浏览器和外部网络，不将无浏览器的静态测试冒充运行验收。

## Review

已审阅修复范围、脚本时序、静态 meta、浏览器真实加载、双入口约定和文档一致性。静态检查不再错误要求提前执行 AdSense，默认拒绝与队列保留均未削弱。无新增依赖、CMP 或域名配置，当前修复无未解决代码阻断项。CMP 端到端验收是当前任务未解决项，不能以本 PR 或 roadmap 冒充已完成；没有独立的已接受后续项。

## Risks

修复 hydration 不等于修复 Google CMP 的站点消息投放；未出现真实消息前，不能声称 GA 完整遵循所有选择。全局默认拒绝可能减少统计可识别的回访。高级模式允许无 Cookie 请求。

[Google 文档](https://support.google.com/adsense/answer/10959060?hl=en)说明自动撤回链接只加到已批准且有 AdSense 代码的站点；这支持单独检查网站资格，但不能据此断言审核状态就是整套 CMP 未出现的唯一原因。首屏两按钮同样是 [Google 支持的配置](https://support.google.com/adsense/answer/7584263?hl=en)，没有因缺少首屏拒绝按钮就擅自调整同意选项。
