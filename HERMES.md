# Hermes

## 状态：Turborepo 与随笔已通过 Workbench 发布

当前目标：Turborepo 单仓库、Bun NestJS + Drizzle PostgreSQL、密码写作及随笔显隐/删除。

功能分支：`feat/turborepo-bun-storage`，基线：`803a4d875fbdeff50e6bbc919ef8925bee93187c`；PR #32 已合并到 `master` 的 `2a20313b9f893689b4481801992446344ca21600`。当前 `feat/journal-release-verification` 仅同步部署验收文档。

开发与验收：[turborepo-bun-storage](docs/development/turborepo-bun-storage.md)。用户已确认默认公开、`/write` 隐藏入口及 UI 方案。

实现：`apps/blog` + `apps/api`、根目录 Turborepo、密码会话、默认公开与显隐/编辑/确认删除、隐藏 `/write` 入口。38 项常规测试、3 项 PostgreSQL 集成测试、类型/构建/lint、桌面/手机浏览器流程及编译后 Bun API 均通过。用户重启 Docker 后，本地 API 镜像构建、博客静态产物装入 Nginx 镜像、真实 PostgreSQL 容器迁移及完整 HTTP 验收均通过。

PR：[随笔与单仓库改造 #32](https://github.com/ljh12138164/blog/pull/32) 于2026-10-28 21:03 CST 合并。CI [#125](https://github.com/ljh12138164/blog/actions/runs/40685459283) 未能启动 verify：GitHub 报告账号近期付款失败或 Actions 支出额度不足；没有运行代码步骤，不能据此判断镜像通过或失败。

2026-10-28 21:55 CST 已发布代码 `ab9cb32b1897325a69cc077eae656a6240674b27` 的博客与 API 镜像；独立 `blog-storage` 项目使用 PostgreSQL 17 持久卷、端口18088。构建、测试和压缩全部在本地，服务器仅导入镜像、显式迁移和启动服务；API/数据库分别限制0.5 CPU、256/192 MiB。其他服务与原镜像保留钩子未改动。回滚配置位于 `/opt/stacks/blog/backups/sha-ab9cb32b1897325a69cc077eae656a6240674b27-workbench-20261028T135504Z`。

公网根域名 HTTP 验收和手机 Chrome 密码登录/退出/公开列表通过；隐藏测试记录已删除。blog 子域名默认解析节点172.67.66.3在当前网络超时，指定 Cloudflare 节点104.21.3.160并保持原 Host、SNI、证书校验后，页面/API/sitemap 均通过，未改 DNS。写作密码仅存本机忽略文件 `.secrets/journal-production-password.txt`；服务器 `.env` 权限600，只有密码哈希。

完整博客 Docker builder 因代理下载依赖迟缓而取消，本次发布使用已通过本机 `pnpm build` 的静态产物与同版 Nginx 运行配置；不能声称该 builder 或 Actions 已通过。待账号额度/网络恢复后补验标准流水线。功能代码已合并，本分支只提交上线验收与回滚记录。无接受的后续功能，不创建空路线图。

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
