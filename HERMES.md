# Hermes

## 当前目标

将博客发布改为 GitHub Actions 构建 Docker 镜像、通过受限 SSH 传输镜像发布包、服务器本地导入并运行；不使用 GHCR 或 GitHub Packages。

## 状态

设计已确认，正在准备实施计划。

## 下一步

审阅并确认 `docs/superpowers/specs/2026-08-17-docker-image-bundle-deploy-design.md`，然后实施并验证发布链路。

## 验证

- 已从最新 `origin/master` 创建隔离分支 `feat/docker-image-bundle-deploy`。

## 阻塞

无。
