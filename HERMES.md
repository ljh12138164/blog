# Hermes

## 当前目标

只使用 `ljhboard.cn` 一个注册域名，通过 Custom Hostnames 与 CFST 动态优选入口改善中国内地访问，并将实践整理为博客文章。

## 状态

进行中。用户已确认单域名方案：复用 `origin-ai.ljhboard.cn` 回源，`cdn.ljhboard.cn` 作为 CFST 更新的 DNS-only A 记录，`ai`/`blog` 使用 Custom Hostnames；根域不使用 Worker，保持橙云并通过 Single Redirect 跳转到 `blog.ljhboard.cn`。Cloudflare for SaaS fallback origin 已设置并显示有效，现有生产 DNS 仍由用户手工切换。

已新增《Cloudflare 的优选 IP 优化》文章，覆盖启用前绑定支付方式、DNS 拓扑、Custom Hostname、CFST 安装、API Token 与 Record ID、更新脚本、宝塔计划任务、根域重定向、验证和回滚，并保留 8 个图片占位。文章已加入首页最新文章与 Cloudflare 归档，`pnpm typecheck`、`pnpm build` 和静态产物检查通过。

首页归档已移除整个“项目文档”、“优化记录”和“AI 调用”分组，共 11 个入口；对应文章文件和历史 URL 保留。

站点头部博客名称左侧的“✦”已替换为项目 `/favicon.ico`，保留原 30px 圆形图标布局。

已定位线上 canonical 冲突：CI 和 Dockerfile 曾把源站 IP 作为 `NEXT_PUBLIC_SITE_URL` 默认值，Cloudflare 又只重写了部分 HTTP URL。站点公开 URL 现统一由 `site.config.json` 固定为 `https://blog.ljhboard.cn`，构建流程不再接受 IP build arg，并新增全量静态 HTML canonical/og:url 校验。

SEO 修复已通过 `pnpm typecheck`、`pnpm build` 和 `pnpm verify:seo`；全部导出 HTML 每页只有一个正式域名 canonical。`docker compose config` 通过，本机 Docker Desktop Linux engine 未运行，因此本地镜像构建仍由 CI 验证。线上旧 HTML 需部署新镜像并清除或绕过 Cloudflare 缓存后才会更新。

GitHub Actions 已删除源站 IP 的 `DEPLOY_HOST` 默认值，部署目标必须由 production 环境的 GitHub Variable `DEPLOY_HOST` 提供；站点公开 URL 仍固定为 `https://blog.ljhboard.cn`。

## 下一步

用户补充文章截图后，将占位块替换为实际图片。生产配置先完成 `blog.ljhboard.cn` Custom Hostname 和 DNS 灰度，验证成功再切 `ai`；根域最后配置 Single Redirect。所有入口稳定后，再用宝塔每 6 小时运行一次优选脚本。

## 计划验证

文章阶段已完成 `pnpm typecheck`、`pnpm build`、Pagefind、sitemap 与静态产物检查。部署阶段仍需运行 `docker compose config` 与 Docker 构建，再验证三个正式主机名的 DNS、TLS、状态、内容和三网数据。

## 阻塞

Workbench RAM 用户缺少 `ecs:DescribeInstances`，暂不能枚举 ECS 或部署宝塔任务；Cloudflare 社区优选拓扑不受官方稳定性保证，必须逐域名灰度并保留原 DNS 回滚值。北京 ECS 的 CFST 结果也只代表单机房出口，不代表全国三网。

