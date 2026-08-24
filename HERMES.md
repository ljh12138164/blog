# Hermes

## 当前目标

维护已迁移到当前独立博客的内容：删除 RAG 文章，并按 `/teach` 的教学结构重写提示词与 Token/Context 两篇文章。

## 状态

文章删除与重写已完成；类型检查、静态构建、Pagefind 和站点地图产物均已通过。本次调整将提交到 blog PR #8。

## 下一步

等待 [blog PR #8](https://github.com/ljh12138164/blog/pull/8) 的检查与合并。

## 计划验证

- `pnpm typecheck`
- `pnpm build`
- 校验 `out/index.html`、`out/_pagefind/pagefind.js`、`out/sitemap.xml`、`out/robots.txt`
- 桌面与移动端检查首页、近期文章、历史文章、搜索和代码块

## 阻塞

无本地阻塞。
