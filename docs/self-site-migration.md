# self 个人站迁移对照

本次迁移的目标是把 `self.ljhboard.cn/` 完整首页迁入博客的“关于我”页 `/about`。博客首页 `/` 保持文章布局，不改成个人主页，也不把摘几段简介视为完整迁移。生产切换前，原站和原项目保留。

## 来源

- `D:/code/site`：master `d2ead4e`，只有三个站点与较早的精选项目。
- `C:/Users/34792/.codex/worktrees/homepage-content/site`：`feat/homepage-content`，`5c53bca`，含四站入口、贡献详情、最新文章、工具直达、预览与贡献蛇。
- 2026-10-17 浏览器核对 `https://self.ljhboard.cn/`、`/about`：线上与本地 master 不完全一致，线上含今日热点、GitHub 贡献图、RSSHub 贡献。以较完整工作树的内容结合线上入口迁移；不把 master 中已被移除的 tsup 精选项目带回来。

原项目只读，未覆盖其分支、工作树或部署配置。

## 内容与功能

| 原站内容或功能 | 新位置 | 迁移方式 |
| --- | --- | --- |
| 姓名、头像、浙江、职业、GitHub、邮箱、个人标签、简介、短句 | `/about` 个人介绍 | 原本地 WebP 头像；资料共用 `lib/profile.ts`，文章作者资料使用同一来源 |
| 技术博客、LJH Tools、Token Paper、今日热点 | `/about#sites-section` | 四项完整描述、预览与入口；博客变成 `/posts`，其余保留独立工具站 |
| 网站截图放大 | 关于页各网站预览 | 复用 Nextra ImageZoom，支持键盘与关闭，不移植另一套弹层 |
| JSON 格式化、时间戳、Base64 | 关于页常用工具直达 | 保留对应深层链接与描述 |
| 最新文章与完整归档 | 关于页最近文章、`/posts` | 使用本站文章数据，不再抓取自己旧域名的 RSS；保留最近文章模块及本站手记列表 |
| GitHub 公开活动 / 贡献蛇 | `/about#activity` | 保留工作树的明暗 SVG、减少动态效果、可键盘横向滚动；按用户要求仅使用已保存的静态快照，不迁入 cron 或生成任务 |
| ProComponents、AutoForm、RSSHub | `/about#projects` | 仓库入口、Star/Fork、具体问题、本人改动、PR、两张本地实现截图及放大预览；原站状态注明 2026-10-02，不当成实时状态 |
| GitHub 数量同步及失败情况 | 关于页贡献区 | 通过公共 API 更新 Star/Fork；失败保留标明日期的原站快照，不需要密钥 |
| 技术栈及分类 | `/about#skills` | 保留原站全部条目、描述和五类筛选；使用可按下按钮和原生列表，不引入图标或 UI 依赖 |
| 关于页、三个做事原则、工具与经验分工、联系 | `/about` | 合并此前的编辑、纠错、版权说明，补今日热点与 RSSHub；标题改成作者姓名 |
| 隐私说明、主题、统计、广告、外部服务 | `/privacy`、全站布局 | 按合并后的真实服务说明，补 GitHub API 请求说明；沿用博客主题，不复制旧 GA、AdSense、SW |
| 备案、邮件、GitHub、隐私导航 | 全站页脚与关于页 | 复用现有备案及联系信息；保留原有关于页入口 |

没有复制原 Astro 运行时、Quicksand 字体包、旧 Service Worker、旧 favicon、旧分析脚本或旧 IndexNow 密钥；这些职责已经由博客提供。技能的文字条目完整保留，图标装饰沿用博客的文字排版。旧站静态截图作为历史预览保留，不宣称是迁移后的页面截图。

## 域名和路径

上线前不关闭 self，不启用跳转。新版验证后，self `/` → `https://ljhboard.cn/about`、`/about` → `/about`、`/privacy` → `/privacy`；关于页的 `#sites-section` 锚点继续有效。旧图片如果存在外部引用，应先保留源站静态资源或单独映射到 `/profile/*`；不能把图片一律跳到 HTML 首页。

按用户要求，贡献蛇保留为本地静态快照，不配置 cron、生成 action 或相关 artifact 传递。明暗 SVG 随仓库正常构建发布，发布标签仍使用提交 SHA。

部署步骤见 [部署文档](deployment.md)，验收及截图见 [开发记录](development/adsense-trust-domain.md)。

贡献截图的原始出处：ProComponents PR #9226 的 `https://github.com/user-attachments/assets/42b47b09-2649-4645-8a5d-50acb96a24a1`、AutoForm PR #145 的 `https://github.com/user-attachments/assets/7ecc8810-ed15-4399-830b-01edca4acc44`。迁移时将原图保存至 `public/profile/pro-components.png` 与 `autoform.png`，避免浏览器依赖 GitHub 图片外链；保留对应 PR 和原始图片内容。
