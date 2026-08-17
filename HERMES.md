# Hermes

## 当前目标

将发布链路从 GHCR 镜像迁移为 GitHub Actions 构建静态产物并通过受限 SSH 发布到服务器。

## 状态

进行中。

## 已完成

- 已创建 `feat/direct-static-deploy` 分支。
- 已提交 `develop-with-pr` 的本地基线例外规则：`0d9113a`。

## 下一步

审阅改动并提交直接静态发布迁移；推送与 PR 前重新验证 GitHub 网络访问。

## 验证

- 已通过：`develop-with-pr` Skill 官方校验器（使用 `python -X utf8`）。
- 已通过：`bash -n deploy/server/deploy-blog`、`bash -n deploy/server/blog-deploy-gate`。
- 已通过：`pnpm typecheck`、`pnpm build`（后者需要非沙箱环境）。
- 已通过：静态产物存在性与 `git diff --check`。

## 阻塞

远程 `git fetch origin master --prune` 因 GitHub 连接重置失败；用户已确认本地基线为最新。推送与创建 PR 前需要重新验证远程访问。
