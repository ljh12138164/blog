# API 自动发布补全

## Background
PR #35 的验证任务构建了 API 镜像，但生产 deploy 任务仅发布静态博客。用户要求补全后端自动部署，并要求继续在原项目目录开发。

## Scope
- 同一 CI 构建不可变 blog 与 blog-api 镜像，先发布 API，再发布静态博客。
- 复用 DEPLOY_SSH_KEY、受限 gate 与无 registry 镜像包，不向 CI 提供数据库或写作凭据。
- API 更新前备份数据库、执行迁移和凭据初始化，健康检查失败回退应用与配置。
- 首次升级采用此前用户已指定密码的仓库外 Argon2id 哈希；以服务器 bootstrap 文件传递，仅初始化缺失凭据，不覆盖已入库密码。
- 配置服务器一次性部署入口，为后续合入后的 CI 提供可用通道。

## Out of scope
不改页面、不更新数据库镜像、不删除持久卷、不自动还原生产数据库、不自动合并 PR。本轮不主动执行 API 发布或迁移；合入 master 后由 CI 发布。

## Acceptance criteria
- CI 成功必须包含 API 发布与两个域名的 API 就绪检查。
- 备份失败不运行迁移或替换 API；迁移、启动、健康检查失败可恢复旧 API、Compose 和环境配置。
- 生产数据库数据与密码不进入仓库或 CI 日志；已有密码不会被重复部署覆盖。
- gate 仅增加 deploy-api sha-<40位小写十六进制>，保留原有静态发布权限边界。

## Feasibility
可行。复用 ADR 0002 的受限 SSH 与 ADR 0003 的镜像包架构；生产已有 blog-storage Compose、持久数据库和健康 API，CI 已具备 API 构建与 PostgreSQL 17 测试。无需新增依赖、密钥或服务器构建任务。此前 PR #35 已在 master 的 cbc155d 合入，继续原 feat/journal-db-password 分支完成同一交付中的遗漏；两次 fetch 因网络失败，但本地 origin/master 已指向先前经 GitHub 与线上镜像核实的 cbc155d，已快进到该提交。保留用户原有 Dockerfile、deploy-blog 与 public/ 修改。

## Implementation
- deploy-blog-api 使用独立锁、固定 stack 路径、受限发布包与不可变镜像标签。
- pg_dump 自定义格式备份加 pg_restore --list 检查先于迁移；现有 API 在备份和迁移期间继续运行。数据库不随应用回滚自动还原，要求迁移向后兼容，避免抹掉发布后新写入。
- set -E 保证函数中失败也触发 ERR 回滚；原配置和部署脚本有权限受限的备份。只重建 api，不更新 postgres 或执行 remove-orphans。
- 健康后原子更新 API 部署脚本，bootstrap 密码哈希移动到该次权限受限备份目录；重复迁移通过 on-conflict-do-nothing 保留数据库凭据。
- API 与静态博客独立回滚。API 失败阻止新博客发布；若后续静态发布失败，已健康的 API 保留，因此 API/schema 需兼容前一版前端。

## Verification
- 部署脚本 9 项隔离回归通过，包含密码传递不出现在日志、备份顺序、各失败分支回滚、锁竞争及 SSH 命令校验。
- bash -n 与 Biome 通过。
- pnpm typecheck、pnpm build 通过（复用未改应用代码的有效 Turborepo 缓存）；静态导出首页、Pagefind、sitemap、robots 文件齐全。
- workflow YAML 解析与 git diff --check 通过；本机 Docker Desktop 引擎未运行，docker build 无法连接引擎，实际镜像测试由已有 CI 执行。
- 服务器已安装 API helper、扩展 gate/sudoers；visudo 校验通过。旧入口配置备份在 /opt/stacks/blog-storage/backups/ci-entry-20261029T035117Z-125377。实际以 blog-deploy 身份验证了非法 tag 被 gate 拒绝、合法命令可到达 API helper 且损坏归档被拒绝，未执行迁移或重建容器。API 保持原 ab9cb32 镜像且健康。
- 用户已指定密码的仓库外 Argon2id 哈希经本地验证后安全放置到服务器 bootstrap-password.hash，权限 root/600；真实值不进入仓库、本文或 CI。将在首次合入后的自动发布中初始化数据库凭据。

## Review
已按仓库规范与验收项审阅：备份先于迁移、备份失败关闭发布、ERR 在函数中继承、回滚不恢复数据库、凭据只在服务器环境传递、API 先于静态博客、无数据库重建或 remove-orphans。9 项部署回归覆盖关键分支；本地无遗留代码阻塞项，镜像运行等待 CI。无已接受的额外后续项，不创建空路线图。

## Risks
- 首次须通过管理员渠道安装 API helper、gate、sudoers，此后 CI 自行更新 helper。
- 应用回滚保留已应用迁移；非兼容迁移须单独制定恢复方案。
- 数据库备份保存在服务器权限受限的 backups 目录；卷外定期备份继续沿用原有要求。
