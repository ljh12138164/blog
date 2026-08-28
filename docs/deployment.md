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
- `BAIDU_PUSH_TOKEN`：百度搜索资源平台“普通收录”API 的推送 token；泄露后必须在百度平台重新生成。
- `DEPLOY_HOST`、`DEPLOY_PORT` 和 `DEPLOY_USER`（`blog-deploy`）：Actions variables。

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
- 公网验证通过后读取线上 `sitemap.xml`，过滤并去重同站 URL，再通过普通收录 API 提交百度；没有配置 `BAIDU_PUSH_TOKEN` 时明确跳过。

Compose 使用 `pull_policy: never`，因此不会拉取远端镜像。容器 Nginx 配置随 Docker 镜像版本管理；宿主 Nginx 与部署脚本随每次发布包同步。

## 自动回滚与排障

部署前，服务器会备份当前 `IMAGE_TAG`、Compose、宿主 Nginx、gate、sudoers 和部署脚本到 `/opt/stacks/blog/backups/`。健康检查失败时会恢复这一快照并重新启动前一个本地镜像。

```bash
curl -f http://127.0.0.1:18080/healthz
docker image ls 'blog:sha-*'
ls -la /opt/stacks/blog/backups
docker compose -f /opt/stacks/blog/compose.yaml ps
```

## Cloudflare 103 Early Hints

每次静态构建都会从导出的 HTML 提取页面样式表和显式 `preconnect`，生成 `.next/early-hints-map.conf`。Docker 镜像把该映射与同一次构建的静态文件一起打包，容器 Nginx 据此为 HTML 页面返回 `Link` 响应头。宝塔 Nginx 默认透传该响应头。

生产区域还必须在 Cloudflare 控制台进入 `Speed → Settings → Content Optimization`，把 **Early Hints** 切换为开启。Early Hints 只在 HTTP/2 或 HTTP/3 上生效；Cloudflare 需要先从正常页面响应缓存 `Link` 提示，才可能在后续请求中异步发出 `103`。

发布后先验证稳定的响应头契约：

```bash
curl --http2 --silent --show-error --dump-header - --output /dev/null https://blog.ljhboard.cn/
```

最终 `200` 响应应包含带 `rel=preload; as=style` 的 `Link`。随后可重复请求，或使用 Chrome DevTools、WebPageTest 观察 `103 Early Hints`。Cloudflare 在主响应头更快到达、客户端不兼容或 Early Hints 缓存尚未命中时可能不发出 `103`，因此不能把“每次请求都出现 103”作为稳定健康检查。

## 百度普通收录推送

生产发布及公网验证成功后，`scripts/submit-baidu-urls.mjs` 会读取线上 `https://blog.ljhboard.cn/sitemap.xml`，只提交属于正式站点的去重 URL。token 仅通过 GitHub Actions Secret 注入，不写入仓库或命令参数，也不会出现在脚本日志中。

成功日志只显示百度接受数量和剩余配额。HTTP 错误、非 JSON 响应、`not_same_site` 或 `not_valid` URL 会让步骤失败；百度接收 URL 只代表缩短发现时间，不保证最终收录和展现。

## 本地验证

```bash
pnpm install --frozen-lockfile
pnpm test:early-hints
pnpm test:baidu-submit
pnpm typecheck
pnpm build
docker compose config
docker build -t blog:local .
```

构建必须生成 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt` 和 `.next/early-hints-map.conf`。Pull Request 流水线还会启动临时镜像，验证首页与文章页包含 stylesheet preload `Link`，而静态资源与健康检查不包含页面级提示。
