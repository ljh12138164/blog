# Hermes

## 当前目标

将博客发布改为 GitHub Actions 构建 Docker 镜像、通过受限 SSH 传输镜像发布包、服务器本地导入并运行；不使用 GHCR 或 GitHub Packages。

## 状态

分支已推送，待创建 Pull Request 并等待 GitHub Actions 验证 Docker 构建。

## 下一步

在 GitHub 创建 `feat/docker-image-bundle-deploy` 到 `master` 的非草稿 PR；CI 通过后，以 Workbench 执行 `docs/deployment.md` 的一次性服务器引导，再合并 PR。

## 验证

- 已通过：`pnpm typecheck`、`pnpm build`、静态产物检查、Compose 本地镜像渲染、部署脚本语法、workflow YAML 解析、无 Registry 操作扫描和 `git diff --check`。
- 本机 Docker Desktop Linux engine 未运行，实际 `docker build` 需由 GitHub Actions Linux runner 复核。

## 阻塞

当前环境的 GitHub CLI 不可用，浏览器创建 PR 超时；远端分支已推送。
