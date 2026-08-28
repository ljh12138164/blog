# Hermes

## 当前目标

使用教学式结构重写 Cloudflare 103 Early Hints 文章，并在生产验证后自动将线上 sitemap URL 提交至百度普通收录 API。

## 状态

已完成。文章、线上成功截图、百度提交脚本、部署步骤和文档均已实现，整体验证通过。


## 验证

- `pnpm test:early-hints`：4 项通过。
- `pnpm test:baidu-submit`：3 项通过，使用本地 HTTP 服务，未访问真实百度接口。
- `pnpm typecheck`：通过。
- `pnpm build`：通过，导出 42 页；Pagefind 索引 38 页；sitemap 与 SEO 校验通过。
- 文章生成 HTML 正确引用带哈希的成功截图资源；workflow YAML 解析通过。
- 缺少 `BAIDU_PUSH_TOKEN` 时脚本会明确跳过，日志不包含 token。


## 下一步

在百度搜索资源平台废止已暴露的旧 token，并将重新生成的值配置为 GitHub Actions Secret `BAIDU_PUSH_TOKEN`；合并后观察首次生产推送结果。

