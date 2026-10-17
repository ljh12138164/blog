# Hermes

## 状态：进行中

## 目标

删除无法核实的性能数字，允许页面 CSS/JS 抓取，修复并验证 GA 与现有 Google CMP 的同意联动。

## 下一步

分支 `feat/adsense-consent-crawl`，基于 origin/master 3e5e49b。9 篇文章的无据数字已删除，robots 放行 /_next/；同步默认 denied + 防止 React 提升 AdSense 已通过生产导出、typecheck 和 32 项测试。记录见 docs/development/adsense-consent-crawl.md。

用户确认网络恢复。03:39 CST 已保存 Google CMP 广告与分析两项同意模式联动；其他隐私设置未改。线上 Tag Assistant 识别 GA，但旧版本 Config 仍显示未设置默认同意。两个域名强制预览均无 CMP 弹窗，后台编辑器遇 Google 内部 EventBus 加载错误；接受/拒绝/恢复/撤回尚未验证。本地页面已可打开，DOM 中可见默认值、hydration 后 GA config 与 gtag.js，但 Tag Assistant 本地连接超时。需完成草稿 PR 与 CI，在代码发布后验证两域名真实选择；不得声称端到端已完成。两域名直接访问，不改跳转，不提交复审。

草稿 PR：<https://github.com/ljh12138164/blog/pull/30>。代码、文案及静态资源修复已推送，CI 运行状态以 PR 检查为准；保持草稿，下一步解决真实 CMP 消息验证与发布后的回归。

## 计划验证

同意默认值与时序、接受/拒绝/重新访问，生成 robots 的静态资源访问，文章元数据同步；pnpm typecheck、pnpm build、相关回归、PR CI。线上端到端验证与本地测试分别记录。
