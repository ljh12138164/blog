# Hermes

## 当前目标

新增 `develop-with-pr` 项目 Skill，统一开发需求的 feat 分支、开发文档、验证和 GitHub PR 流程。

## 状态

进行中：Skill、开发文档与项目验证均已完成，等待提交、PR 发布和 GitHub Actions。

## 已完成

- 已通过 `grill-with-docs` 明确工作流边界。
- 已创建 `feat/add-development-workflow` 分支。
- 已初始化 `develop-with-pr` Skill 和对应开发文档。
- 已通过 Skill 官方校验器、类型检查和完整静态构建。

## 下一步

1. 审阅差异，提交、推送并创建 PR。
2. 等待 GitHub Actions 通过。

## 验证

- 已通过：Skill 官方校验器。
- 已通过：`pnpm typecheck`。
- 已通过：`pnpm build`（含 Pagefind 与 sitemap）。
- 已通过：`git diff --check`。

## 阻塞

无。
