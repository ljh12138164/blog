# Hermes

## 当前目标

在 `feat/indexnow-integration` 中以 IndexNow 替换百度普通收录推送：托管公开根密钥，部署验证后提交线上 sitemap，并完成测试、文档、评审与 PR。

## 状态

实现、仓库级验证与双轴评审均完成；尚未推送或创建 PR。

## 验证

- 已确认分支基于最新 `origin/master`，且未创建 worktree。
- 已确认生产 `sitemap.xml` 对普通客户端和 Googlebot UA 均返回 HTTP/2 200 与 `text/xml`。
- Google Indexing API 因仅支持招聘和直播活动结构化数据而排除。
- IndexNow RED→GREEN：4 项协议测试通过，提交为 `f853212`。
- 资源提示 RED→GREEN：静态产物不再包含 preconnect，保留 4 个 DNS-prefetch；Early Hints 的 4 项测试通过，提交为 `658590a`。
- 5 篇文章最终构建标题含站点后缀为 35–53 字符。
- 首次 Docker 构建复现缺少 `.dockerignore` 导致 Windows 依赖覆盖 Linux 依赖；添加构建上下文边界后，同命令成功生成 `blog:local`，上下文从 1.15 GB 降至 36 KB。
- 完整验证通过：9 项测试、Biome、typecheck、42 页静态构建、Pagefind 38 页、workflow YAML、关键产物、Compose 与 Docker 镜像。
- 双轴评审无阻塞项；无接受的后续工作，因此不创建路线图。

## 下一步

提交文档与 `.dockerignore`，运行最终完成门验证，然后推送分支并创建 PR。
