# 部署说明

仓库采用 Turborepo。本文静态站点的 `out/`、`public/`、`.next/`、`scripts/` 及 Next 配置路径以 `apps/blog/` 为根；命令默认在仓库根目录执行。

## Turborepo 与随笔服务

博客现位于 `apps/blog`，静态产物为 `apps/blog/out`，构建脚本随应用迁移。根 `Dockerfile` 仍构建博客镜像，原发布包、受限 SSH 和博客回滚流程保持可用。CI 额外安装 Bun 1.4.4，使用 PostgreSQL 17 service 运行 HTTP 集成测试，并构建、启动 API 镜像验证迁移与就绪检查。

API 采用独立的 `compose.api.yaml` 项目 `blog-storage`，不加入现有博客 Compose，避免博客发布的 `--remove-orphans` 删除数据库。首次 API 发布需要单独准备服务器密钥和持久卷；当前博客自动发布包只包含博客镜像，不会代为部署数据库或执行迁移。

在构建机器上：

```bash
docker build -f apps/api/Dockerfile -t blog-api:sha-<commit> .
docker pull postgres:17-alpine
docker save blog-api:sha-<commit> postgres:17-alpine -o storage-images.tar
```

通过已有管理员渠道将 `storage-images.tar`、`compose.api.yaml` 传到服务器的独立目录，例如 `/opt/stacks/blog-storage`。不要使用只接受博客发布包的受限 `blog-deploy` SSH 入口上传任意文件。服务器不需要安装 Node.js/Bun、不构建镜像或访问镜像仓库。

在该目录创建权限600的 `.env`，设置以下字段；任何真实值都不能提交到仓库：

```dotenv
IMAGE_TAG=sha-<commit>
POSTGRES_PASSWORD=<strong-database-password>
DATABASE_URL=postgres://blog:<URL-encoded-database-password>@postgres:5432/blog
SESSION_SECRET=<at-least-32-random-characters>
```

写作密码哈希存于 PostgreSQL 的 `journal_credentials` 表（`id=owner`），运行中的 API 不再读取环境密码。`SESSION_SECRET` 可在本地用 `bun -e 'console.log(crypto.randomUUID() + crypto.randomUUID())'` 生成。Compose 已强制安全 Cookie，必须通过 HTTPS 使用写作入口。

```bash
docker load -i storage-images.tar
docker compose -f compose.api.yaml up -d --wait postgres
docker compose -f compose.api.yaml run --rm api bun dist/database/migrate.js
docker compose -f compose.api.yaml up -d --wait api
curl -f http://127.0.0.1:18088/api/readyz
```

迁移后须初始化数据库凭据，再使用写作入口。本地开发运行 `pnpm auth:setup`；生产可在本地生成 Argon2id 哈希文件，经已有管理员通道传入权限为 600 的临时文件，再从标准输入写入数据库：

```bash
docker compose -f compose.api.yaml run --rm -T api bun -e 'const { savePasswordHash } = require("./dist/database/credentials.js"); await savePasswordHash(process.env.DATABASE_URL, (await Bun.stdin.text()).trim())' < journal-password.hash
```

旧版本升级时，可在迁移进程单独传入旧 `JOURNAL_PASSWORD_HASH`：`docker compose -f compose.api.yaml run --rm -e JOURNAL_PASSWORD_HASH api bun dist/database/migrate.js`。先在当前 shell 安全加载该变量；它只在数据库没有 owner 凭据时导入，重复迁移不覆盖新密码。升级后移除服务器 `.env` 的旧密码哈希。首次切换新认证实现会使旧格式会话失效，需重新登录。回滚到旧 API 镜像需要恢复旧版本所需的环境配置。

以后改密只需更新 `journal_credentials.password_hash` 的 owner 行，新密码立即生效，旧密码与旧会话失效，无需重启。哈希文件和临时凭据不得提交 Git。

Uptime Kuma 已配置“博客后端 · API 与数据库”监控（ID 15），通过 Docker 内网每 60 秒检查 `http://blog-storage-api-1:3001/api/readyz`，仅接受 200。Uptime 容器须加入外部 `blog-storage_default` 网络；服务器 `/opt/stacks/uptime-kuma/compose.yaml` 已持久声明该网络。该接口检查数据库连通性，和仅检查静态博客的监控分开。

宿主 Nginx 将 `/api/` 代理到 `127.0.0.1:18088`，博客继续使用 `127.0.0.1:18080`。`18081` 已由其他应用占用。仓库维护的是 `ai.ljhboard.cn` 源站虚拟主机；如果正式域名由其他虚拟主机承接，也需在那里配置相同的 `/api/` 代理和 `/write` 的禁止缓存规则，不能据此认为其他域名自动具备代理。

生产 API 与数据库分别限制为 0.5 CPU、256 MiB / 192 MiB 内存；数据库连接数限制为 20，连接池为 5。遵循用户要求，镜像构建、测试和压缩在本地完成，服务器仅加载镜像、执行迁移和运行服务，不运行依赖安装或构建。

CDN 不应缓存 `/api/*` 与 `/write*`，也不能给 API 添加允许任意来源的 CORS 响应头。源站 API 响应带 `Cache-Control: no-store`；`/write` 页面也带 `noindex` 与 `no-store`，Service Worker 对这两个路径使用网络请求。随笔正文只存数据库，不进入静态导出、Pagefind、RSS 或 LLM 索引。

更新 API 时先备份数据库，再显式执行已审阅的迁移，之后切换不可变镜像。数据库迁移不随镜像回滚自动撤销；需确认旧镜像兼容新 schema。`postgres_data` 是独立持久卷，常规发布不要执行 `down -v`。定期将 `pg_dump` 备份保存到卷外并验证恢复。

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
- 普通贡献热力图使用仓库内的明暗 SVG 静态快照，随正常构建发布；不配置 cron、贡献蛇生成或相关 artifact 传递。
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

每次静态构建都会从导出的 HTML 提取页面样式表，生成 `.next/early-hints-map.conf`。Docker 镜像把该映射与同一次构建的静态文件一起打包，容器 Nginx 据此为 HTML 页面返回 `Link` 响应头。宝塔 Nginx 默认透传该响应头。第三方监测域名只保留 `dns-prefetch`，不再通过 HTML 或 Early Hints 提前建立连接。

生产区域还必须在 Cloudflare 控制台进入 `Speed → Settings → Content Optimization`，把 **Early Hints** 切换为开启。Early Hints 只在 HTTP/2 或 HTTP/3 上生效；Cloudflare 需要先从正常页面响应缓存 `Link` 提示，才可能在后续请求中异步发出 `103`。

发布后先验证稳定的响应头契约：

```bash
curl --http2 --silent --show-error --dump-header - --output /dev/null https://ljhboard.cn/
```

最终 `200` 响应应包含带 `rel=preload; as=style` 的 `Link`。随后可重复请求，或使用 Chrome DevTools、WebPageTest 观察 `103 Early Hints`。Cloudflare 在主响应头更快到达、客户端不兼容或 Early Hints 缓存尚未命中时可能不发出 `103`，因此不能把“每次请求都出现 103”作为稳定健康检查。

## 正式域名切换与 self 资料迁移

正式地址为 `https://ljhboard.cn`，统一来源是 `site.config.json`。CI 公网验证和服务器健康检查必须同步切换；首次切换失败后，回滚健康检查允许旧版 `blog.ljhboard.cn` canonical，正常发布仍只接受根域名。源站 `ai.ljhboard.cn`、证书路径和 SaaS 回源配置保持按现有部署链路管理。

按下面顺序发布，保留根域名和 blog 两个直接访问入口：

1. 发布本次镜像，验证根域名首页、`/about`、`/privacy`、代表文章及 `/ads.txt`；检查 HTML head 中唯一的 AdSense 验证 meta、同步默认同意、根域名 canonical，以及 sitemap 中的根域名 URL。浏览器加载后检查默认同意脚本只有一份，无 hydration 错误。AdSense 仅由文章末尾的手动广告位按需加载；首页、归档、关于、隐私、随笔和写作页不加载广告脚本。
2. 保持 `ljhboard.cn` 与 `blog.ljhboard.cn` 均直接提供同一份静态内容，不配置两个主机之间的跳转。分别验证首页、文章及 `/sitemap.xml` 返回 200；两端 HTML 的 canonical 和 sitemap 正文均使用根域名 URL。
3. 按[完整迁移对照](self-site-migration.md)核验“关于我”的资料、四站入口、工具、贡献与技术栈；将 self 首页及 `/about` 永久跳转至 `https://ljhboard.cn/about`，`/privacy` 跳至根域名隐私页，保留查询参数和有效锚点。旧图片保留服务或映射至 `/profile/*`，不能全部送到 HTML 页面；工具子域名不参与迁移。确认新入口与旧链接正常后再停旧个人站服务。关闭原站每日贡献蛇部署任务，避免重复部署旧服务；博客不接替该定时任务。
4. GSC 已有 `sc-domain:ljhboard.cn` 网域资源；在该资源检查正式 sitemap 的读取、代表文章实时抓取和 Google 选择的 canonical。保留历史报告用于对照，不把“实时测试可索引”写成“已经收录”。
5. 查看 Cloudflare 安全事件时按主机、时间及 Google 相关用户代理筛选；对命中记录核对路径、方法、规则和爬虫身份。不能仅凭用户代理或 Google Cloud ASN 放行，也不要为了审核关闭全站 WAF。发布后重新核对 AdSense ads.txt 和所有权区域，内容修订完成后再由站长决定复审。

历史 sitemap-0.xml 的抓取失败与当前 sitemap.xml 应分别处理。若仍有旧 sitemap 引用，先核对旧清单是否完整映射，再处理旧提交或提供对应重定向。核查记录见 [AdSense 与搜索后台核查](adsense-search-audit.md)。

### 两个域名直接访问与 sitemap

2026-10-18 控制台复核：两条单一重定向均禁用；名为“从根重定向到WWW”的旧规则实际匹配根域名，目标是 blog。页面规则仅有图片域名缓存设置。本次只查看，没有保存或启用线上规则。

用户明确保留两个域名直接访问，不配置 blog 到根域名的 301。两端同一文章声明相同的根域名 canonical，sitemap 与站内链接使用同一规范地址。[Google 的规范网址说明](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)支持通过 canonical 与 sitemap 表达偏好，不要求为此跳转。

`next-sitemap.config.cjs` 从 `site.config.json` 读取规范域名，构建时生成同一份 `out/sitemap.xml` 和 `out/robots.txt`。两个域名服务同一静态产物，因此两端 `/sitemap.xml` 均可直接访问；地图内每个内容页面只列根域名版本，不重复列出相同内容的 blog URL。生产以构建生成的 `out/robots.txt` 为准，忽略的本地 `public/robots.txt` 旧文件不作为配置来源。

发布后验收：

- 两个域名的首页、`/about`、代表文章和 `/sitemap.xml` 均返回 200，不发生跨域跳转。
- 两端同一篇文章的 canonical 相同，指向根域名同路径；地图中的 `<loc>` 也采用根域名地址。
- 两端 `/robots.txt` 均声明 `Sitemap: https://ljhboard.cn/sitemap.xml`。
- GSC 使用已有 `sc-domain:ljhboard.cn` 网域资源提交根域名 sitemap，并核对地图读取状态、正文抓取及 Google 选择的 canonical。可访问入口与 Google 最终索引的规范 URL 是不同概念。

同一内容有多个 URL 时，Google 建议 sitemap 只列偏好的规范版本，见[构建与提交 sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)。这项配置保留双域名访问，但不能保证索引或 AdSense 审核结果。

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

## 手动广告与删文发布

全局布局只保留 AdSense 账号验证 meta，不再加载广告库。文章正文末尾使用一个响应式展示广告位；`apps/blog/site.config.json` 的 `articleAdSlot` 填入 AdSense 广告单元代码中的真实 `data-ad-slot`。空值或非法值时不渲染广告位，也不加载广告库。启用前在 AdSense 后台确认本站自动广告已关闭，避免同一广告库触发自动投放。`data-ad-format="auto"` 只表示手动广告位自适应尺寸。

本次删除 `/posts/jebet-optimization`、`/posts/design-optimization`、`/posts/canvas-library-research`，同时清理旧中文路径重定向、摘要和站内索引。发布必须替换整份静态产物，不能将新文件覆盖到保留旧 HTML 的目录。发布后对两个域名的旧文章与旧中文 URL 验证 404，并按实际缓存情况清除这些 URL 的 Cloudflare 缓存；检查 sitemap、RSS、llms 和搜索索引均无已删除文章。不要将这些地址统一跳转首页。

Google CMP 的真实接受、拒绝、撤回流程仍需独立验证，移除全局广告库不能视为该流程已通过。当前改动不提交 AdSense 复审，不保证审核结果。
