# Hermes

## 状态：API 自动部署本地验证完成，准备新 PR

按用户要求在原项目目录 C:/Users/PC/Desktop/front/TEST/blog 工作，继续 feat/journal-db-password 分支完成同一功能交付遗漏。已快进到已合入的 origin/master cbc155d；保留 Dockerfile、deploy/server/deploy-blog、public/ 的原有修改。

目标：CI 先发布 API（备份、迁移、凭据初始化、健康检查和失败回滚），再发布静态博客；复用受限 SSH，不让凭据经过 CI。此前用户指定密码的哈希只从仓库外传到服务器 bootstrap 文件。

开发文档：[api-ci-deployment](docs/development/api-ci-deployment.md)；之前交付和回归见 [journal-db-password](docs/development/journal-db-password.md)。

已实现 deploy-blog-api、gate/sudoers 的最小命令扩展、CI 镜像构建与 API 发布步骤、双域名就绪检查。9 项隔离部署回归与 Bash 语法检查通过；测试已修复函数内失败未触发 ERR 回滚的问题。数据库不自动还原，失败回滚只恢复应用与配置。

验证：9 项部署回归、Bash 语法、Biome、workflow YAML、类型检查和构建通过。Docker Desktop 引擎未运行，镜像验证待 CI。服务器 API helper、gate、sudoers 已安装并校验，入口配置有备份；新密码 bootstrap 哈希 root/600 已就绪。当前 API 仍为旧镜像且健康，未执行生产发布、迁移或改密。

下一步：提交本任务文件、创建新 PR 并检查 CI；合入 master 后自动先发布 API，再发布博客。