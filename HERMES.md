# Hermes

## 当前目标

在 `feat/article-index` 中新增 `/posts` 文章索引页，提交项目级 `frontend-design` 技能与 UI Skills MCP 配置，并优化 `develop-with-pr` 的 UI Skills 接入规则。

## 状态

实现、全量验证、双轴评审、提交与分支推送均已完成。当前环境没有 `gh`，GitHub PR 页面在内置浏览器和 Chrome 中均连接超时，因此 PR 尚未创建。

## 下一步

打开 <https://github.com/ljh12138164/blog/compare/master...feat/article-index?expand=1> 创建面向 `master` 的 PR；分支 `feat/article-index` 已推送并跟踪远端。

## 计划验证

- `pnpm check`
- `pnpm typecheck`
- `pnpm build`
- 检查 `out/posts.html`、Pagefind、sitemap 与 robots
- 校验文章索引数量和排序
- 桌面、平板和 390px 移动端视觉检查
