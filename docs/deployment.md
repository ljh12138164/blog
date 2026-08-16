# 部署说明

## 架构

```text
GitHub master
  → GitHub Actions 验证静态导出
  → 构建并推送 ghcr.io/ljh12138164/blog:sha-<commit>
  → 受限 SSH 命令
  → /opt/stacks/blog/compose.yaml
  → 127.0.0.1:18080
  → 宝塔 Nginx :80/:443
```

应用容器只监听回环地址，不直接暴露公网端口。宝塔 Nginx 是多个项目共享的边缘入口。

## GitHub 配置

在仓库 `Settings → Secrets and variables → Actions` 中配置：

### Secrets

- `DEPLOY_SSH_KEY`：仅用于 `blog-deploy` 强制命令的私钥。
- `DEPLOY_KNOWN_HOSTS`：服务器 SSH Ed25519 主机公钥对应的 known_hosts 行。

### Variables

- `DEPLOY_HOST`：`60.205.171.159`
- `DEPLOY_PORT`：`22`
- `DEPLOY_USER`：`blog-deploy`
- `SITE_URL`：`http://60.205.171.159`

绑定域名后只需修改 `SITE_URL`、宝塔 Nginx 的 `server_name`，并配置 HTTPS。

## 流水线行为

- Pull Request：安装依赖、类型检查、静态构建和产物验证，不发布。
- 推送 `master`：验证后构建 `sha-<commit>` 与 `latest` 镜像，推送 GHCR 并部署 immutable 标签。
- 手动触发：不填写标签时重新构建当前 commit；填写现有 `sha-<40位commit>` 时直接重新部署该版本。
- 生产部署串行执行，不在切换容器时取消正在进行的发布。

GHCR 包首次创建后需在 GitHub Package settings 中将可见性设为 Public。

## 服务器文件

```text
/opt/stacks/blog/compose.yaml
/opt/stacks/blog/.env
/usr/local/bin/blog-deploy-gate
/usr/local/sbin/deploy-blog
/www/server/panel/vhost/nginx/blog.conf
```

`blog-deploy` 用户的 SSH 公钥被限制为调用 gate。gate 只接受：

```text
deploy sha-<40位小写十六进制commit>
```

## 健康检查与回滚

容器和发布脚本都请求 `/healthz`。新版本在 60 秒内未健康时，脚本恢复 `.env` 中的上一个镜像标签并重新启动容器；流水线保持失败状态以便排查。

查看状态：

```bash
cd /opt/stacks/blog
docker compose ps
docker compose logs --tail 100 web
curl -f http://127.0.0.1:18080/healthz
```

手动回滚应优先从 GitHub Actions 的 `workflow_dispatch` 指定旧的 immutable 标签，不要直接改用含义可变的 `latest`。

## 本地验证

```bash
pnpm install --frozen-lockfile
pnpm typecheck
NEXT_PUBLIC_SITE_URL=http://60.205.171.159 pnpm build
docker compose config
docker build --build-arg NEXT_PUBLIC_SITE_URL=http://60.205.171.159 -t blog:local .
```

构建必须生成 `out/index.html`、Pagefind、sitemap 和 robots 文件。
