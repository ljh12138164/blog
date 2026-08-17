# 部署说明

## 架构

```text
GitHub master
  → GitHub Actions 构建 blog:sha-<commit>
  → docker save 镜像 + 仓库部署配置
  → 受限 SSH 标准输入
  → ECS docker load + docker compose up
  → 宝塔 Nginx → 127.0.0.1:18080 → 容器 Nginx
```

服务器不安装 Node.js、不构建站点或 Docker 镜像，也不访问 GHCR、GitHub Packages 或任何镜像仓库。2 GB 内存只承担已构建容器的运行。

## GitHub 配置

在仓库 `Settings → Secrets and variables → Actions` 配置：

- `DEPLOY_SSH_KEY`：仅用于 `blog-deploy` 强制命令的私钥。
- `DEPLOY_KNOWN_HOSTS`：服务器 SSH Ed25519 主机公钥对应的 `known_hosts` 行。
- `DEPLOY_HOST`、`DEPLOY_PORT`、`DEPLOY_USER`（`blog-deploy`）和 `SITE_URL`：Actions variables。

不需要 GHCR token、Packages token 或 Docker registry 凭据。

## 一次性服务器引导

首次启用镜像发布包前，以 root 从此仓库安装受限入口，并保留当前正在运行的容器与 `/opt/stacks/blog/compose.yaml`：

```bash
install -m 755 deploy/server/deploy-blog /usr/local/sbin/deploy-blog
install -m 755 deploy/server/blog-deploy-gate /usr/local/bin/blog-deploy-gate
install -m 440 deploy/server/blog-deploy.sudoers /etc/sudoers.d/blog-deploy
mkdir -p /opt/stacks/blog/backups
bash -n /usr/local/sbin/deploy-blog
bash -n /usr/local/bin/blog-deploy-gate
visudo -cf /etc/sudoers.d/blog-deploy
```

`blog-deploy` 的 SSH 公钥必须被限制为调用 gate；它只接受：

```text
deploy sha-<40位小写十六进制commit>
```

gate 不提供 shell、SFTP 或任意命令执行。

## 流水线行为

- Pull Request：安装依赖、类型检查、静态构建和产物验证，不发布。
- 推送 `master`：验证通过后在 Actions Runner 构建 `blog:sha-<commit>`，打包 `image.tar`、`compose.yaml`、宿主 Nginx 和部署脚本，再传输给服务器。
- 手动触发：基于所选 Git ref 重建并发布该 ref，对历史版本回滚时选择对应的提交或引用。
- 服务器验证发布包、`docker load` 镜像、同步受管配置、执行 `docker compose up -d --remove-orphans web`，并检查 `http://127.0.0.1:18080/healthz`。

Compose 使用 `pull_policy: never`，因此不会拉取远端镜像。容器 Nginx 配置随 Docker 镜像版本管理；宿主 Nginx 与部署脚本随每次发布包同步。

## 自动回滚与排障

部署前，服务器会备份当前 `IMAGE_TAG`、Compose、宿主 Nginx、gate、sudoers 和部署脚本到 `/opt/stacks/blog/backups/`。健康检查失败时会恢复这一快照并重新启动前一个本地镜像。

```bash
curl -f http://127.0.0.1:18080/healthz
docker image ls 'blog:sha-*'
ls -la /opt/stacks/blog/backups
docker compose -f /opt/stacks/blog/compose.yaml ps
```

## 本地验证

```bash
pnpm install --frozen-lockfile
pnpm typecheck
NEXT_PUBLIC_SITE_URL=http://60.205.171.159 pnpm build
docker compose config
docker build --build-arg NEXT_PUBLIC_SITE_URL=http://60.205.171.159 -t blog:local .
```

构建必须生成 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml` 和 `out/robots.txt`。
