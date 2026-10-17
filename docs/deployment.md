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
- 贡献图使用仓库内的明暗 SVG 静态快照，随正常构建发布；不配置 cron、贡献蛇生成或相关 artifact 传递。
- 服务器验证发布包、`docker load` 镜像、同步受管配置、执行 `docker compose up -d --remove-orphans web`，并检查 `http://127.0.0.1:18080/healthz`。
- 公网页面和根目录 IndexNow 密钥验证通过后，读取线上 `sitemap.xml` 并向 IndexNow 全局端点提交同站 URL。

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

每次静态构建都会从导出的 HTML 提取页面样式表，生成 `.next/early-hints-map.conf`。Docker 镜像把该映射与同一次构建的静态文件一起打包，容器 Nginx 据此为 HTML 页面返回 `Link` 响应头。宝塔 Nginx 默认透传该响应头。第三方监测与广告域名只保留 `dns-prefetch`，不再通过 HTML 或 Early Hints 提前建立连接。

生产区域还必须在 Cloudflare 控制台进入 `Speed → Settings → Content Optimization`，把 **Early Hints** 切换为开启。Early Hints 只在 HTTP/2 或 HTTP/3 上生效；Cloudflare 需要先从正常页面响应缓存 `Link` 提示，才可能在后续请求中异步发出 `103`。

发布后先验证稳定的响应头契约：

```bash
curl --http2 --silent --show-error --dump-header - --output /dev/null https://ljhboard.cn/
```

最终 `200` 响应应包含带 `rel=preload; as=style` 的 `Link`。随后可重复请求，或使用 Chrome DevTools、WebPageTest 观察 `103 Early Hints`。Cloudflare 在主响应头更快到达、客户端不兼容或 Early Hints 缓存尚未命中时可能不发出 `103`，因此不能把“每次请求都出现 103”作为稳定健康检查。

## 正式域名切换与 self 资料迁移

正式地址为 `https://ljhboard.cn`，统一来源是 `site.config.json`。CI 公网验证和服务器健康检查必须同步切换；首次切换失败后，回滚健康检查允许旧版 `blog.ljhboard.cn` canonical，正常发布仍只接受根域名。源站 `ai.ljhboard.cn`、证书路径和 SaaS 回源配置保持按现有部署链路管理。

按下面顺序发布，避免跳转环路：

1. 发布本次镜像，验证根域名首页、`/about`、`/privacy`、代表文章及 `/ads.txt`；检查 HTML head 中只有一个 async AdSense 脚本、验证 meta、根域名 canonical，以及 sitemap 中的根域名 URL。
2. 在 Cloudflare 停用任何根域名到 blog 的历史跳转后，将 `blog.ljhboard.cn` 和 `www.ljhboard.cn` 永久跳转到根域名对应路径，保留查询参数。旧文章必须跳到同一文章路径，不能全部送到首页。
3. 按[完整迁移对照](self-site-migration.md)核验“关于我”的资料、四站入口、工具、贡献与技术栈；将 self 首页及 `/about` 永久跳转至 `https://ljhboard.cn/about`，`/privacy` 跳至根域名隐私页，保留查询参数和有效锚点。旧图片保留服务或映射至 `/profile/*`，不能全部送到 HTML 页面；工具子域名不参与迁移。确认新入口与旧链接正常后再停旧个人站服务。关闭原站每日贡献蛇部署任务，避免重复部署旧服务；博客不接替该定时任务。
4. GSC 已有 `sc-domain:ljhboard.cn` 网域资源；在该资源检查正式 sitemap 的读取、代表文章实时抓取和 Google 选择的 canonical。保留历史报告用于对照，不把“实时测试可索引”写成“已经收录”。
5. 查看 Cloudflare 安全事件时按主机、时间及 Google 相关用户代理筛选；对命中记录核对路径、方法、规则和爬虫身份。不能仅凭用户代理或 Google Cloud ASN 放行，也不要为了审核关闭全站 WAF。发布后重新核对 AdSense ads.txt 和所有权区域，内容修订完成后再由站长决定复审。

历史 sitemap-0.xml 的抓取失败与当前 sitemap.xml 应分别处理。若仍有旧 sitemap 引用，先核对旧清单是否完整映射，再处理旧提交或提供对应重定向。核查记录见 [AdSense 与搜索后台核查](adsense-search-audit.md)。

## IndexNow 通知

`public/1da648d59c024d869f2523943dce4c6b.txt` 是协议要求的公开所有权证明，随静态站点发布到根目录，不是 GitHub Secret。生产流水线先验证公网密钥内容，再由 `scripts/submit-indexnow-urls.mjs` 读取线上 sitemap，过滤并去重正式站点 URL，最后向 `https://api.indexnow.org/indexnow` 发送一个 JSON 批次。

HTTP 非成功响应、空 URL 集合或超过每批 10,000 URL 会使通知步骤失败，但不会回滚已经成功的生产部署。成功只表示 IndexNow 接收通知，不保证抓取、收录或排名；使用 Bing Webmaster Tools 核对收到的 URL。

## 本地验证

```bash
pnpm install --frozen-lockfile
pnpm test:early-hints
pnpm test:indexnow-submit
pnpm typecheck
pnpm build
pnpm test:resource-hints
docker compose config
docker build -t blog:local .
```

构建必须生成 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`、`.next/early-hints-map.conf` 和根目录 IndexNow 密钥。Pull Request 流水线还会启动临时镜像，验证首页与文章页包含 stylesheet preload `Link`，而静态资源与健康检查不包含页面级提示。
