# Hermes

## 当前目标

修复 Docker 镜像发布后公网请求返回 404：宿主机 Nginx 必须把请求反向代理到 `127.0.0.1:18080`。

## 状态

宿主机 Nginx 反向代理配置已修正并通过本地检查，正在创建独立修复分支。

## 下一步

推送 `feat/fix-host-nginx-proxy` 并创建到 `master` 的 Pull Request；合并后由 GitHub Actions 安装修正后的反向代理配置。

## 验证

- 已定位：部署脚本覆盖 `/www/server/panel/vhost/nginx/60.205.171.159.conf`，旧配置仍指向 `/opt/stacks/blog/current`。
- 已通过：部署脚本语法、Compose 渲染和 `git diff --check`；部署时还会在 reload 前运行服务器 Nginx 语法检查。

## 阻塞

Workbench CLI 当前仍报 `missing port in address`；若无法恢复，将由新的 GitHub Actions 部署应用配置。
