# Hermes

## 当前目标

将博客发布改为 GitHub Actions 构建 Docker 镜像、通过受限 SSH 传输镜像发布包、服务器本地导入并运行；不使用 GHCR 或 GitHub Packages。

## 状态

本地实现与可用验证已完成，正在准备 Pull Request。

## 下一步

提交文档与验证记录、推送分支并创建 PR；等待 GitHub Actions 验证 Docker 构建。合并前以 Workbench 执行 `docs/deployment.md` 的一次性服务器引导。

## 验证

- 已通过：`pnpm typecheck`、`pnpm build`、静态产物检查、Compose 本地镜像渲染、部署脚本语法、workflow YAML 解析、无 Registry 操作扫描和 `git diff --check`。
- 本机 Docker Desktop Linux engine 未运行，实际 `docker build` 需由 GitHub Actions Linux runner 复核。

## 阻塞

无；本机 Docker 构建由 GitHub Actions 验证。
