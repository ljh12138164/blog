# Hermes

## 当前目标

将 `D:\code\canvas\apps\blog` 的旧博客内容迁入当前独立博客，保留当前 Nextra 视觉风格，以旧博客标题和主要文案为准，并改善代码块可读性。

## 状态

实现、评审、本地构建和浏览器验收已完成；正确的 blog PR #8 已创建。错误创建的 canvas PR #3 已关闭且未合并。

## 下一步

等待 [blog PR #8](https://github.com/ljh12138164/blog/pull/8) 的检查完成；通过后合并到 `master`。

## 计划验证

- `pnpm typecheck`
- `pnpm build`
- 校验 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`
- 桌面与移动端检查首页、近期文章、历史文章、搜索和代码块

## 阻塞

无本地阻塞；等待远端检查。
