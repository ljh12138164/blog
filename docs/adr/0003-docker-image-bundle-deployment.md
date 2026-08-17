# 使用无 Registry 的 Docker 镜像发布包

状态：已采纳。

博客继续以项目 Docker 镜像运行，宝塔 Nginx 统一负责公网入口并反向代理至 `127.0.0.1:18080`。GitHub Actions 构建不可变 `blog:sha-<commit>` 镜像，使用 `docker save` 将其与 Compose、宿主 Nginx 及受限部署脚本组成发布包；ECS 通过受限 SSH 接收后 `docker load` 并启动本地镜像。

此方案不需要 GHCR 或 GitHub Packages，也不让 2 GB 服务器构建 Node.js 产物或 Docker 镜像。它保留仓库对每个项目容器与 Nginx 配置的版本管理，并以配置快照和前一镜像标签支持健康检查失败后的自动回滚。
