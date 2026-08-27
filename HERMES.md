# Hermes

## 当前目标

重构站点字体体系与首页，采用标题衬线、正文/UI 无衬线，以及编辑型首页方案 A。

## 状态

进行中：字体与首页方案 A 已实现并通过最终双轴复审，Standards 与 Spec 均无剩余问题；类型检查、lint、完整构建、静态产物和桌面/移动视觉复核通过。分支 `feat/editorial-homepage-fonts` 已推送。开发文档见 `docs/development/editorial-homepage-fonts.md`。

此前 Google 脚本加载优化已实现并验证，详细范围与结果记录于 `docs/development/optimize-google-scripts.md`。

此前中国内地访问优化工作仍等待用户补充文章截图与执行生产 DNS 灰度，不在本次代码改动范围内。

已新增《Cloudflare 的优选 IP 优化》文章，覆盖启用前绑定支付方式、DNS 拓扑、Custom Hostname、CFST 安装、API Token 与 Record ID、更新脚本、宝塔计划任务、根域重定向、验证和回滚，并保留 8 个图片占位。文章已加入首页最新文章与 Cloudflare 归档，`pnpm typecheck`、`pnpm build` 和静态产物检查通过。

首页归档已移除整个“项目文档”、“优化记录”和“AI 调用”分组，共 11 个入口；对应文章文件和历史 URL 保留。

站点头部博客名称左侧的“✦”已替换为项目 `/favicon.ico`，保留原 30px 圆形图标布局。

已定位线上 canonical 冲突：CI 和 Dockerfile 曾把源站 IP 作为 `NEXT_PUBLIC_SITE_URL` 默认值，Cloudflare 又只重写了部分 HTTP URL。站点公开 URL 现统一由 `site.config.json` 固定为 `https://blog.ljhboard.cn`，构建流程不再接受 IP build arg，并新增全量静态 HTML canonical/og:url 校验。

SEO 修复已通过 `pnpm typecheck`、`pnpm build` 和 `pnpm verify:seo`；全部导出 HTML 每页只有一个正式域名 canonical。`docker compose config` 通过，本机 Docker Desktop Linux engine 未运行，因此本地镜像构建仍由 CI 验证。线上旧 HTML 需部署新镜像并清除或绕过 Cloudflare 缓存后才会更新。

GitHub Actions 已删除源站 IP 的 `DEPLOY_HOST` 默认值，部署目标必须由 production 环境的 GitHub Variable `DEPLOY_HOST` 提供；站点公开 URL 仍固定为 `https://blog.ljhboard.cn`。

## 下一步

打开 `https://github.com/ljh12138164/blog/compare/master...feat/editorial-homepage-fonts?expand=1` 创建 Pull Request，然后检查 CI。

## 计划验证

运行 `pnpm typecheck`、`pnpm build`，检查必需静态产物，并视觉检查桌面/移动首页与代表性文章。

## 阻塞

当前环境没有 GitHub CLI，内置浏览器访问 GitHub 时连接被重置，因此无法代为完成 PR 创建；远端分支已就绪。

Workbench RAM 用户缺少 `ecs:DescribeInstances`，暂不能枚举 ECS 或部署宝塔任务；Cloudflare 社区优选拓扑不受官方稳定性保证，必须逐域名灰度并保留原 DNS 回滚值。北京 ECS 的 CFST 结果也只代表单机房出口，不代表全国三网。

