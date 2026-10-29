# Hermes

## 状态：删除三篇文章，改用手动广告，验证中

目标：删除 `/posts/jebet-optimization`、`/posts/design-optimization`、`/posts/canvas-library-research` 及附图和站内引用；撤掉全局广告加载，改为文章末尾手动展示广告。用户要求合入前公开 GitHub 仓库，本轮不合并、不发布、不提交复审。

分支：`feat/manual-article-ads`。远端 fetch 凭据失效，用户已明确同意以本机 master 为基线继续。

开发文档：[manual-article-ads](docs/development/manual-article-ads.md)。删文和组件已实现，`apps/blog/site.config.json.articleAdSlot` 已配置用户给出的 `7125495670`。浏览器已恢复；AdSense 按网站列表为空，不能声称已关闭后台自动广告。用户已确认公开仓库，浏览器正在执行最终确认流程。

已通过类型检查、构建、37 项相关测试与静态产物删文检查；用户要求跳过后续测试。Docker 引擎未启动；实际广告加载、手机与导航行为未完整验证。

下一步：完成仓库公开并确认状态；提交本地变更，尝试推送并创建 PR。GitHub Git 凭据失效；后台自动广告状态仍待确认。

既有 GA/CMP 验证尚未完成真实接受、拒绝、恢复、撤回流程，详细状态保留在 [GA 发布回归](docs/development/ga-production-validation.md)。此前 PR #32 的本地发布任务与历史证据见 [Turborepo 开发文档](docs/development/turborepo-bun-storage.md)，本轮不延伸旧发布授权。
