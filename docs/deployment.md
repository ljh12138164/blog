# 部署说明

## 架构

```text
GitHub master → GitHub Actions 构建静态站点 → 受限 SSH 标准输入上传
→ /opt/stacks/blog/releases/sha-<commit> → current（原子切换）
→ 宝塔 Nginx :80/:443
```

服务器不安装 Node.js、不构建站点、不使用 Docker 或 GHCR；2 GB 内存只承担 Nginx 静态文件服务。

## GitHub 配置

在仓库 `Settings → Secrets and variables → Actions` 中配置：

- `DEPLOY_SSH_KEY`：仅用于 `blog-deploy` 强制命令的私钥。
- `DEPLOY_KNOWN_HOSTS`：服务器 SSH Ed25519 主机公钥对应的 known_hosts 行。
- `DEPLOY_HOST`、`DEPLOY_PORT`、`DEPLOY_USER`（`blog-deploy`）和 `SITE_URL`：Actions variables。

## 服务器安装

以 root 安装：

```text
/usr/local/bin/blog-deploy-gate       ← deploy/server/blog-deploy-gate
/usr/local/sbin/deploy-blog           ← deploy/server/deploy-blog
/etc/sudoers.d/blog-deploy            ← deploy/server/blog-deploy.sudoers
/www/server/panel/vhost/nginx/blog.conf ← deploy/host-nginx.conf
```

创建 `/opt/stacks/blog/releases`，确保 Nginx 可读取 `/opt/stacks/blog`，检查并重载 Nginx 后确认 `/healthz` 返回 200。

`blog-deploy` 的 SSH 公钥被限制为调用 gate；它只接受：

```text
deploy sha-<40位小写十六进制commit>
```

Actions 将 `out/` 压缩后写入该 SSH 命令的标准输入。gate 不提供 shell、SFTP 或任意命令执行。

## 流水线行为

- Pull Request：安装依赖、类型检查、静态构建和产物验证，不发布。
- 推送 `master`：验证通过后重新构建，发布到不可变 `sha-<commit>` release。
- 手动触发：填写已有标签时切换到该 release，用于回滚。
- 脚本验证 `index.html`、Pagefind、sitemap 与 robots，原子切换 `current` 并检查 `/healthz`；失败时恢复上一 release。

## 回滚与排障

在 GitHub Actions 的 `workflow_dispatch` 填入已有 `sha-<40位commit>` 标签即可回滚。

```bash
readlink -f /opt/stacks/blog/current
curl -f http://127.0.0.1/healthz
ls -la /opt/stacks/blog/releases
```

## 本地验证

```bash
pnpm install --frozen-lockfile
pnpm typecheck
NEXT_PUBLIC_SITE_URL=http://60.205.171.159 pnpm build
```

构建必须生成 `out/index.html`、Pagefind、sitemap 和 robots 文件。
