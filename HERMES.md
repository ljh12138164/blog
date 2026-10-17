# Hermes

## 状态：进行中

## 目标

删除无法核实的性能数字，允许页面 CSS/JS 抓取，修复并验证 GA 与现有 Google CMP 的同意联动。

## 下一步

分支 `feat/adsense-consent-crawl`，基于 origin/master 3e5e49b。9 篇文章的无据数字已删除，robots 放行 /_next/；同步默认 denied + 防止 React 提升 AdSense 已通过生产导出、typecheck 和 32 项测试。记录见 docs/development/adsense-consent-crawl.md。

AdSense 与 Tag Assistant 连续连接关闭；线上强制预览无 CMP 弹窗；Chrome 本地预览被客户端拦截。用户已收到后台连接情况的异步问题。需恢复连接核实 Google CMP 广告/分析联动，并在代码发布后验证两域名首次、接受、拒绝、刷新和撤回；不得声称已完成端到端验证。当前先整理草稿 PR，继续跟进 CI。两域名直接访问，不改跳转，不提交复审。

## 计划验证

同意默认值与时序、接受/拒绝/重新访问，生成 robots 的静态资源访问，文章元数据同步；pnpm typecheck、pnpm build、相关回归、PR CI。线上端到端验证与本地测试分别记录。
