# 使用直接静态 release 部署

状态：已被 [0003-docker-image-bundle-deployment](0003-docker-image-bundle-deployment.md) 替代。

该决策曾将静态导出文件直接上传到服务器，并让宿主 Nginx 提供服务。它避免了 GHCR 和服务器构建，但不再保留仓库管理的 Docker、Compose 与容器 Nginx 部署边界，因此被镜像发布包方案替代。
