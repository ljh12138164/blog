# Hermes

## 当前目标

将 `D:\code\canvas\apps\blog` 的旧博客内容迁入当前独立博客，保留当前 Nextra 视觉风格，以旧博客标题和主要文案为准，并改善代码块可读性。

## 状态

正在 `feat/migrate-canvas-blog-content` 分支实施；错误创建的 canvas PR #3 已关闭。

## 下一步

迁移 32 篇历史文章及图片，完成近期/历史分组和浅色代码块后运行 `pnpm typecheck`、`pnpm build` 与浏览器验收。

## 计划验证

- `pnpm typecheck`
- `pnpm build`
- 校验 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`
- 桌面与移动端检查首页、近期文章、历史文章、搜索和代码块

## 阻塞

无。
