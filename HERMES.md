# Hermes

## 当前目标

在独立分支 `feat/error-pages` 中，将 Next.js 默认 404 与可恢复错误边界改造成符合博客视觉体系的错误状态页面。

## 状态

设计已由用户确认，技术可行性评审完成，正在实现。用户明确要求跳过自动化测试。

- Early Hints 已在独立分支 `feat/cloudflare-early-hints` 提交为 `8348d6e`；GitHub 网络超时导致暂未推送。
- 本任务从用户确认的本地最新 `master@b4e6c9c` 创建，不混入 Early Hints 改动。
- UI Skills MCP 注册表未在当前任务暴露；按仓库现有设计系统与本地 UI 规范执行。

## 验证

计划运行 `pnpm typecheck`、`pnpm build`，检查静态 404 产物，并在桌面与移动端检查布局。

## 下一步

实现共享错误状态组件、404 与 error 页面，再执行类型检查、生产构建和渲染检查。
