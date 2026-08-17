# Hermes

## 当前目标

将发布链路从 GHCR 镜像迁移为 GitHub Actions 构建静态产物并通过受限 SSH 发布到服务器。

## 状态

进行中。

## 已完成

- 已创建 `feat/direct-static-deploy` 分支。
- 已提交 `develop-with-pr` 的本地基线例外规则：`0d9113a`。

## 下一步

等待 [PR #2](https://github.com/ljh12138164/blog/pull/2) 的 GitHub Actions 结果。

## 验证

- 已通过：`develop-with-pr` Skill 官方校验器（使用 `python -X utf8`）。
- 已通过：`bash -n deploy/server/deploy-blog`、`bash -n deploy/server/blog-deploy-gate`。
- 已通过：`pnpm typecheck`、`pnpm build`（后者需要非沙箱环境）。
- 已通过：静态产物存在性与 `git diff --check`。

## 阻塞

无。
