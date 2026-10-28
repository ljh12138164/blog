# Hermes

## 状态：本地实现与验证完成，准备 PR（Turborepo 与随笔）

当前目标：Turborepo 单仓库、Bun NestJS + Drizzle PostgreSQL、密码写作及随笔显隐/删除。

分支：`feat/turborepo-bun-storage`，基线：远端 `master` 的 `803a4d875fbdeff50e6bbc919ef8925bee93187c`。

开发与验收：[turborepo-bun-storage](docs/development/turborepo-bun-storage.md)。用户已确认默认公开、`/write` 隐藏入口及 UI 方案。

实现：`apps/blog` + `apps/api`、根目录 Turborepo、密码会话、默认公开与显隐/编辑/确认删除、隐藏 `/write` 入口。38 项常规测试、3 项 PostgreSQL 集成测试、类型/构建/lint、桌面/手机浏览器流程及编译后 Bun API 均通过。Docker 本机引擎不可用，容器验证交由 CI。

下一步：创建 PR 并确认 CI；不合并、不生产发布。正式启动需按 README 设置密码与 PostgreSQL，生产 API 独立部署步骤见 `docs/deployment.md`。无接受的后续功能，不创建空路线图。

以下为既有 GA 任务交接，保留上下文；详细记录以 `docs/development/ga-production-validation.md` 为准。

## 目标

完整验证 GA 与现有 Google CMP 的真实同意联动；两域名均保留直接访问，不改跳转、不提交复审。

## 当前结果

PR #30 已获用户明确允许合并并发布，合并提交 `fee4bde7f02b563779977ec9f9bc9623270f7229`；生产流水线 [#121](https://github.com/ljh12138164/blog/actions/runs/39070579514) 的 verify/deploy 均成功。无据数字删除及 robots 放行已上线。

两域名首页、代表文章、robots、sitemap、ads.txt 和首页实际引用的 12 个 CSS/JS 均通过 HTTP 回归。root robots 曾命中旧 Cloudflare 缓存，本轮只清除正式 robots URL，随后该 URL 已允许 /_next/；未修改 DNS、重定向、安全或缓存规则。

真实 Tag Assistant 已验证 root/blog 首页和 blog 代表文章：Config 时四项默认和当前状态均 denied；blog page_view 的 gcs=G100。尚无真实 CMP update，不能当作接受/拒绝完整通过。

2026-10-18 约 05:45 CST 重试后，完整后台消息编辑器恢复。发现网站信息的隐私政策 URL 为 `http://ljhboard.cn`，已保存为 `https://ljhboard.cn/privacy`，关闭重开后确认保持；未修改其他同意选项、未重新发布消息。当前两个入口强制预览仍无 CMP，接受、拒绝、恢复、撤回均未验证。AdSense 网站页显示需要注意/低价值内容，ads.txt 已授权；所有权面板只显示验证方式，未出现独立的验证成功状态，不据此补写已通过。

## 下一步

当前分支 `feat/ga-production-validation` 基于上述 master 合并提交。回归发现 AdSense 提前向 head 插入 show_ads_impl，触发 hydration 重建，默认/AdSense 各两份；本地静态服务和 dev 均复现。已改 Next Script afterInteractive，保留同步 default 和官方验证 meta，删除原 AdSenseScript 小组件。原始 CUA reload 检查由 defaults=2/ads=2 变为各一份，全新页面无 hydration 错误且 Google 托管脚本实际加载。pnpm build、typecheck、32 项测试通过。

最终差异审阅已完成，代码提交 `2836dfe`，修复 PR [#31](https://github.com/ljh12138164/blog/pull/31) 已创建。CI [#122](https://github.com/ljh12138164/blog/actions/runs/39072494786) 已启动；最终状态以 PR 最新检查为准。修复后的本地生产产物已再次经 Tag Assistant 验证四项默认/当前 denied，default 早于 Config。

下一步：确认 PR #31 最新 CI，用户允许合并发布后回归线上 hydration，再继续真实 CMP 选择。此新修复尚未获生产发布授权；PR #30 的发布授权已执行，不扩展为自动发布新 PR。详细证据与验收见 [GA 发布回归](docs/development/ga-production-validation.md)。完整 GA 验证仍受站点上未显示真实 CMP 阻塞；不能再写后台编辑器不可用。
