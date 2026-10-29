# 删除三篇文章并改用手动广告

## Background

AdSense 因复制内容拒绝本站审核。用户决定删除三篇文章、使用手动广告，并要求合入前将 GitHub 仓库公开。远端 fetch 因凭据失效失败，用户明确确认以本机 master 继续；分支为 `feat/manual-article-ads`。

## Scope

删除 jebet-optimization、design-optimization、canvas-library-research 的页面、附图、摘要、入口和旧路径映射；重建静态索引。撤去全站广告库，在保留文章正文末尾接入一个响应式手动展示广告位。准备公开仓库，核查历史，不合并或发布。

## Out of scope

不改其他文章正文，不关闭 blog 域名入口，不改 canonical，不提交复审，不更改 GA 同意策略。

## Acceptance criteria

- 三篇文章和专属图片不出现在导出目录，RSS、sitemap、llms、搜索索引和站内入口不再引用。
- 首页、归档、关于、隐私、随笔和写作页不引入 AdSense 广告库或广告位；验证 meta 保留。
- 保留文章最多一个正文末尾手动广告位；未配置真实 slot 时完全不加载广告。
- 保留同步 denied 默认同意；类型检查、构建、相关回归通过。
- 仓库公开必须在合入前完成；本轮不合并、不发布。

## Feasibility

可行。Nextra 从 MDX 页面生成文章集合，RSS/llms/Pagefind/sitemap 随构建生成；无需新依赖。复用现有 Article 包装器和 Next Script，严格按文章 canonical 识别投放位置，避免隐私页也使用包装器而误投。用户已选择删文和手动广告，沿用现有正文布局、Tailwind 样式和响应式宽度，不新增页面或交互。

关键约束：手动广告仍需共享 AdSense 库，后台自动广告若开启会额外投放；启用前必须确认其关闭。用户已提供真实广告位 ID `7125495670`，已写入配置；空配置仍支持停投。客户端切换文章通过 slug key 创建新广告元素；等待库加载及非零宽度，每个元素仅提交一次请求，避免 StrictMode 或 resize 重复提交。旧中文重定向须同时移除，不能保留指向删文的 301。

## Implementation

`site.config.json.articleAdSlot` 控制文章广告位；空值不加载广告库。根布局保留账号验证和同步 consent default。已通过项目配置的 UI Skills MCP 读取 baseline-ui 和 interface-design，用于差异审阅；沿用现有文章字号和 muted 色，不添加动画、卡片或新依赖。正文末尾复用 Article 组件，在作者卡片之前放手动广告。清理三篇文章的 MDX、专属图片、摘要和历史映射。构建重建公开索引。双域名约定不变。

## Verification

- `pnpm typecheck`、`pnpm build` 通过（两工作区）；构建生成 36 篇文章，Pagefind 索引 38 页，SEO canonical 检查通过。
- Web 单元测试 27 项通过；构建后广告范围、删文、同意默认值、资源提示和个人页测试共 10 项通过。
- 对整份静态导出（含 Pagefind 压缩片段）扫描，未发现三个已删除 URL；首页、Pagefind、sitemap、robots 产物齐全。
- Biome 检查通过。用户随后要求跳过后续测试，停止追加验证。
- 浏览器只确认文章包含一个 ID 正确、宽 720px 的广告元素、一个默认同意脚本且无横向溢出；该次观察未出现广告库脚本，未证明实际广告请求成功，也未完成移动端及路由切换验证。
- `docker compose config` 通过；`docker build -t blog:local .` 因 Docker daemon 未运行而无法执行。
- 公开前扫描本地全部可达历史中的 927 个文本 blob，匹配项经核查为测试值或占位示例，未发现所查格式的真实凭据；该扫描不保证涵盖所有敏感信息类型。
- GitHub 凭据目前失效，推送及 PR 尚未完成。浏览器已进入公开确认流程，用户已在执行时确认公开。

## Risks

删文和手动广告不能保证审核通过。真实 CMP 的接受/拒绝/撤回验证仍未完成，见 [GA 验证](ga-production-validation.md)。网站仍在待审核状态，不能以未展示实际广告判定组件故障或成功。公开仓库会暴露全部源码及 Git 历史，须在公开前核查。发布后需要验证旧链接 404 及 CDN 缓存。

## Review

已审阅删文范围、引用与旧重定向、全局广告撤除及按文章挂载逻辑。未发现需另开功能路线图的接受项，不创建空路线图。交付仍需恢复 GitHub 推送认证并创建 PR；后台自动广告关闭状态及真实广告加载尚未完成确认，发布前必须处理，不能标记整项任务完成。
