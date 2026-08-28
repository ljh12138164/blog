# Hermes

## 当前目标

完善 Cloudflare 103 Early Hints 实战文章：加入完整映射生成脚本，并移除 `app/posts` 全部文章中的自检问答段落；生产部署继续自动提交百度普通收录。

## 状态

已完成。103 文章包含真实成功截图与完整生成器源码，35 篇文章的自检问答段落已移除，全站静态输出验证通过。


## 验证

- 已确认 `app/posts` 不再包含自检标题或问答提示。
- 已逐行确认文章中的生成器代码与 `scripts/generate-early-hints.mjs` 一致。
- `pnpm test:early-hints`：4 项通过。
- `pnpm test:baidu-submit`：3 项通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过，导出 42 页；Pagefind 索引 38 页；sitemap 与 SEO 校验通过。


## 下一步

在百度搜索资源平台废止旧 token，将新值配置为 GitHub Actions Secret `BAIDU_PUSH_TOKEN`；合并后观察生产部署与推送结果。

