# Agent Guidelines

## 个人站迁移的页面归属

域名约定：`ljhboard.cn` 与 `blog.ljhboard.cn` 均保留直接访问，不配置 blog 到根域名的 301。两端提供同一份静态内容与 sitemap，canonical 和 sitemap 正文统一使用 `https://ljhboard.cn`；不能把选定规范域名理解为授权关闭或跳转另一入口。

用户确认：将 `self.ljhboard.cn/` 的完整首页内容与功能迁入本博客的“关于我”页 `/about`。博客首页 `/` 保留文章布局，不把个人站迁成博客首页，也不能仅摘录几段简介视为迁移完成。贡献图使用普通 GitHub 提交热力图的本地快照，不保留贪吃蛇或动画，不配置 cron 或贡献蛇生成任务。按用户要求省略关于页的最近文章；文末只保留联系方式，移除做事原则、文章推荐、写作/纠错/引用说明及为什么写，保留技术栈图标。

本项目是一个基于 Next.js App Router 与 Nextra 4 构建的个人技术博客。

## 开发与维护规范
- 详见 [CONTEXT.md](file:///c:/Users/PC/Desktop/front/TEST/blog/CONTEXT.md) 了解项目核心架构与术语。
- 详见 [HERMES.md](file:///c:/Users/PC/Desktop/front/TEST/blog/HERMES.md) 记录并交接当前任务状态。
- 详见 [.agents/skills/maintain-blog/SKILL.md](file:///c:/Users/PC/Desktop/front/TEST/blog/.agents/skills/maintain-blog/SKILL.md) 维护文章元数据与构建要求。
- 详见 [.agents/skills/write-blog-post/SKILL.md](file:///c:/Users/PC/Desktop/front/TEST/blog/.agents/skills/write-blog-post/SKILL.md) 撰写与改写技术博文（去 AI 痕迹与工程师语调规范）。

## 构建与验证
```bash
pnpm typecheck
pnpm build
```
