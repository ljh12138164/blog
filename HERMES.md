# Hermes

## 状态：进行中

目标：AdSense 静态脚本、正式域名迁至 https://ljhboard.cn、个人资料迁入及实证文章打磨；核查 AdSense / GSC / Cloudflare。

分支：`feat/adsense-trust-domain`，基线为最新 `origin/master`。

开发文档：`docs/development/adsense-trust-domain.md`。

已核实：AdSense ads.txt 已授权，拒审项为低价值内容；GSC blog 前缀 22 页已收录、50 页未收录（2026-10-12 更新）。后台保持只读，未申请复审。

已完成：实现、后台核查、代表文章与手机预览；最终 typecheck/build/SEO 与健康回滚检查通过。核查记录：`docs/adsense-search-audit.md`；发布和搜索跟踪顺序见 `docs/roadmaps/adsense-trust-domain.md`。

## 下一步：提交、推送、创建 PR 并检查 CI。未发布生产、未切换旧域名跳转、未提交复审。
