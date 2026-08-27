# Hermes

## 当前目标

使用 `teach` 教学方法重写 `app/posts` 中除《Cloudflare 的优选 IP 优化》外的 35 篇文章，并为适合的流程、时序、状态和架构内容加入 Mermaid。

## 状态

进行中：已完成第一批 AI 基础文章教学化改造：`agent-fundamentals` 补充学习目标、Agent 执行时序图、自检与官方延伸阅读；`token-and-context` 补充 Context 预算流图；`prompting-principles` 补充提示词评测闭环图。Nextra Mermaid 在 pnpm 严格依赖下需要直接声明 `@theguild/remark-mermaid@0.3.0`，现已加入。`pnpm typecheck` 与 `pnpm build` 通过，42 个静态页面、Pagefind、sitemap 和 canonical 校验成功。分支为 `feat/teach-rewrite-posts`。

此前字体与首页方案 A 已通过 PR #11 合并到 `master`，开发文档见 `docs/development/editorial-homepage-fonts.md`。

此前 Google 脚本加载优化已实现并验证，详细范围与结果记录于 `docs/development/optimize-google-scripts.md`。

此前中国内地访问优化工作仍等待用户补充文章截图与执行生产 DNS 灰度，不在本次代码改动范围内。

已新增《Cloudflare 的优选 IP 优化》文章，覆盖启用前绑定支付方式、DNS 拓扑、Custom Hostname、CFST 安装、API Token 与 Record ID、更新脚本、宝塔计划任务、根域重定向、验证和回滚，并保留 8 个图片占位。文章已加入首页最新文章与 Cloudflare 归档，`pnpm typecheck`、`pnpm build` 和静态产物检查通过。

首页归档已移除整个“项目文档”、“优化记录”和“AI 调用”分组，共 11 个入口；对应文章文件和历史 URL 保留。

站点头部博客名称左侧的“✦”已替换为项目 `/favicon.ico`，保留原 30px 圆形图标布局。

已定位线上 canonical 冲突：CI 和 Dockerfile 曾把源站 IP 作为 `NEXT_PUBLIC_SITE_URL` 默认值，Cloudflare 又只重写了部分 HTTP URL。站点公开 URL 现统一由 `site.config.json` 固定为 `https://blog.ljhboard.cn`，构建流程不再接受 IP build arg，并新增全量静态 HTML canonical/og:url 校验。

SEO 修复已通过 `pnpm typecheck`、`pnpm build` 和 `pnpm verify:seo`；全部导出 HTML 每页只有一个正式域名 canonical。`docker compose config` 通过，本机 Docker Desktop Linux engine 未运行，因此本地镜像构建仍由 CI 验证。线上旧 HTML 需部署新镜像并清除或绕过 Cloudflare 缓存后才会更新。

GitHub Actions 已删除源站 IP 的 `DEPLOY_HOST` 默认值，部署目标必须由 production 环境的 GitHub Variable `DEPLOY_HOST` 提供；站点公开 URL 仍固定为 `https://blog.ljhboard.cn`。

## 下一步

继续第二批 React/API 文章：`react-execution-order`、`react-query-api-optimization`、`type-safe-routing`、`for-of-vs-foreach`，先核对 React、TanStack Query、TypeScript 与 MDN 官方资料，再教学化重写并构建验证。

## 计划验证

每批运行 `pnpm typecheck` 与 `pnpm build`；最终检查 `out/index.html`、Pagefind、sitemap、robots、SEO，并确认排除文章内容哈希未变化。

## 阻塞

Workbench RAM 用户缺少 `ecs:DescribeInstances`，暂不能枚举 ECS 或部署宝塔任务；Cloudflare 社区优选拓扑不受官方稳定性保证，必须逐域名灰度并保留原 DNS 回滚值。北京 ECS 的 CFST 结果也只代表单机房出口，不代表全国三网。

