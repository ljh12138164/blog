# 中国内地访问优选

## 目标

只使用 `ljhboard.cn` 一个注册域名，按参考文章的 Cloudflare for SaaS 优选思路改善中国内地访问，不接入 `ljhselfblog.cn` 或阿里云 CDN/ESA。

参考资料：

- [Cloudflare 优选 IP 实践](https://www.acofork.com/posts/cf-fastip)
- [XIU2/CloudflareSpeedTest](https://github.com/XIU2/CloudflareSpeedTest)
- [Cloudflare Custom Hostnames](https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/custom-hostnames/)
- [Cloudflare DNS Record API](https://developers.cloudflare.com/api/resources/dns/subresources/records/methods/edit/)
- [Cloudflare Workers Routes](https://developers.cloudflare.com/workers/configuration/routing/routes/)

## 基线

2026-08-25 的检查结果：

- `ai.ljhboard.cn` 与 `ljhboard.cn` 都是橙云 A 记录，源站为北京 ECS `60.205.171.159`。
- `blog.ljhboard.cn` 尚不存在。
- `origin-ai.ljhboard.cn` 已存在并代理到同一源站，因此直接复用，不新增第二个回源记录。
- Cloudflare 链路的首页 TTFB 约为 1.5–2 秒，边缘节点常见为 SEA；直连北京源站的诊断 TTFB 约为 0.13 秒。
- 源站使用 Cloudflare Origin CA 证书，不能把正式域名直接灰云到源站 IP。
- HTML 当前为 `Cache-Control: no-cache`、`cf-cache-status: DYNAMIC`。缓存优化另行实施，本次先完成入口优选。

## 已确认拓扑

```text
origin-ai.ljhboard.cn -- Proxied A --> 60.205.171.159

cdn.ljhboard.cn       -- DNS-only A --> <CFST 选出的 Cloudflare IPv4>
ai.ljhboard.cn        -- DNS-only CNAME --> cdn.ljhboard.cn
blog.ljhboard.cn      -- DNS-only CNAME --> cdn.ljhboard.cn
ljhboard.cn           -- DNS-only CNAME/flatten --> cdn.ljhboard.cn
```

- `ai.ljhboard.cn` 与 `blog.ljhboard.cn` 由 `ljhboard.cn` zone 的 Custom Hostnames 提供边缘证书、Host 路由和回源，fallback origin 为 `origin-ai.ljhboard.cn`。
- Custom Hostname 不能与 SaaS zone 本身同名，因此根域 `ljhboard.cn` 使用 Worker Route `ljhboard.cn/*` 反代到 `origin-ai.ljhboard.cn`。
- `cdn.ljhboard.cn` 是唯一动态记录。正式入口保持不动，自动任务只更新这个 DNS-only A 记录。
- 根域灰云触发 Worker Route 属于参考文章使用的社区技巧，不是 Cloudflare 官方保证的标准拓扑；若实测不通，根域立即回滚原橙云 A 记录。

## 实施顺序

1. 保留当前 DNS 记录值作为回滚基线。
2. 将 Cloudflare for SaaS fallback origin 设置为 `origin-ai.ljhboard.cn` 并确认状态为有效。
3. 创建 `blog.ljhboard.cn` Custom Hostname；它目前没有生产流量，先用它验证优选 IP、证书、Host 路由和回源。
4. 创建 DNS-only `cdn.ljhboard.cn` A 记录和 `blog.ljhboard.cn` CNAME。
5. `blog` 全链路验证通过后，再创建并切换 `ai.ljhboard.cn` Custom Hostname/DNS。
6. 部署并验证根域 Worker，最后切换根域 DNS。
7. 所有正式入口稳定后，再启用宝塔定时任务更新 `cdn.ljhboard.cn`。

## 根域 Worker

Worker 源码位于 `cloudflare/worker/src/index.js`，配置位于 `cloudflare/worker/wrangler.jsonc`。

```bash
pnpm cloudflare:worker:check
pnpm cloudflare:worker:preview
pnpm cloudflare:worker:production
```

- preview Worker 不绑定正式路由，用于部署检查。
- production 环境才声明 `ljhboard.cn/*` route。
- Worker 流式转发响应，不读取完整响应体；异常时记录结构化错误并返回 502。

## CloudflareSpeedTest 自动更新

### 为什么可以用

CloudflareSpeedTest 可以输出按下载速度、延迟和丢包筛选后的 CSV，第一条数据是本次测速的首选 IP。仓库脚本 `deploy/server/cloudflare-fastip` 读取该结果，通过 Cloudflare DNS API 只更新 `cdn.ljhboard.cn`。

局限是北京 ECS 的结果只代表该机房出口到 Cloudflare 的线路，不等于全国电信、联通、移动真实用户体验。它适合作为免费自动化的单点信号，后续若要提高代表性，应增加不同运营商探针，而不是提高 ECS 扫描频率。

### 安装 CFST

先用 `uname -m` 确认架构。当前文档锁定 CFST `v2.3.5`；Linux amd64 发布包的官方 release SHA-256 为：

```text
c4c8fc76b4e1bf2bdb5ced8b765956d82dda7bc4eb59df5c04053f0f7db98d90
```

将 release 中的 `cfst` 与 `ip.txt` 放到 `/opt/cloudflare-speed-test/`，校验哈希后给二进制执行权限。不要让宝塔任务每次都下载或执行 `latest` 版本。

### 配置

将 `deploy/server/cloudflare-fastip` 安装为 `/usr/local/sbin/cloudflare-fastip`，权限 `755`。复制 `deploy/server/cloudflare-fastip.env.example` 为 `/etc/cloudflare-fastip.env`，填写：

- 仅限 `ljhboard.cn` zone 的 API Token，权限为 Zone Read、DNS Read、DNS Write。
- zone ID。
- `cdn.ljhboard.cn` 的 DNS record ID。

环境文件必须由 root 所有且权限为 `600`。Token 不能写入 Git、宝塔任务命令或任务日志。

### 宝塔计划任务

在“计划任务”中新建 Shell 脚本，每 6 小时运行一次：

```bash
set -a; . /etc/cloudflare-fastip.env; set +a; /usr/local/sbin/cloudflare-fastip
```

脚本包含以下保护：

- `flock` 防止任务重叠。
- 默认并发 50，避免服务器高并发扫描触发临时限制。
- 只接受预期的 DNS-only A 记录，record ID 指错时拒绝更新。
- 候选 IP 写入前通过 `ai.ljhboard.cn`、`blog.ljhboard.cn` 的真实 HTTPS/SNI 验证。
- API 写入后再次读取记录并复验；失败则恢复旧 IP。
- DNS TTL 为 60 秒，便于回滚。

## 验证与回滚

每个入口切换后检查：

```bash
curl -I https://blog.ljhboard.cn/
curl -I https://ai.ljhboard.cn/
curl -I https://ljhboard.cn/
```

必须同时满足：

- 浏览器证书可信且 SAN 包含访问主机名。
- HTTP 状态和页面内容正确，无 403、Error 1000、异常跳转或串站。
- 响应经过 Cloudflare，回源没有循环。
- DNS 解析为 `cdn.ljhboard.cn` 当前优选 IP。

回滚顺序：暂停宝塔任务，将受影响正式主机名恢复为原橙云 A `60.205.171.159`；根域若失败，同时删除/停用 Worker Route。`origin-ai.ljhboard.cn` 始终保持不变。

## 当前进度

- 已创建 `feat/optimize-china-access` 分支。
- 已将 fallback origin 设置为 `origin-ai.ljhboard.cn`，控制台状态为有效。
- 已部署不绑定正式路由的 `ljhboard-root-proxy-preview` Worker；启动时间 4 ms。
- 本地 `workers.dev` 被污染解析为 `162.125.17.131`，因此预览域名不能作为功能验证依据。
- 尚未切换 `ai.ljhboard.cn`、`ljhboard.cn` 或任何现有生产 DNS。

## 仓库验证

```bash
pnpm cloudflare:worker:check
pnpm typecheck
pnpm build
git diff --check
```

构建后还需检查 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`，以及 `docker compose config` 和镜像构建。
