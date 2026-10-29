# Hermes

## 状态：随笔密码入库与个人页更新，本地验证完成，准备 PR

工作目录：原项目 C:/Users/PC/Desktop/front/TEST/blog；分支 feat/journal-db-password。用户要求不在独立工作区继续开发，已将改动迁回原目录；原有 Dockerfile、deploy/server/deploy-blog 与 public/ 保留，不提交这些无关修改。

开发文档：[journal-db-password](docs/development/journal-db-password.md)。

已完成：Argon2id 凭据改读 PostgreSQL，改密自动使旧会话失效；旧环境哈希仅供迁移初始化，不覆盖已有凭据；新增 RSSHub #23590 贡献；首页标题改为“前端开发与 AI 实践笔记。”。真实密码和生成的哈希仅在仓库外，不写入本文或 Git。

验证：API 6 项单元测试、4 项真实 PostgreSQL 集成测试（65 项断言）、pnpm typecheck 已通过；pnpm build 与静态个人页回归已通过。本机 Docker Desktop 引擎不可用，容器运行检查需依赖 CI。

线上独立操作：Uptime Kuma 已创建监控 ID 15，名称“博客后端 · API 与数据库”，URL http://blog-storage-api-1:3001/api/readyz，间隔 60 秒；最新心跳 200 OK，网络配置已持久保存。未发布新的博客/API 镜像，未修改线上写作密码。

下一步：审阅已完成，提交本任务文件、创建 PR 并检查 CI。生产迁移与密码生效需另行发布。