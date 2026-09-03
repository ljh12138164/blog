# Vitest 迁移与测试演进 roadmap

## Context

Related development document: [迁移测试用例至 Vitest](../development/vitest-migration.md)

## Now

所有既有用例已迁移至 Vitest 并完成验证，CI 与本地检查均正常。

## Next

### 探索 React 组件测试
- Value: 为重要交互组件（如主题切换按钮、代码块复制交互）补充轻量级组件测试，提升界面交互回归防护能力。
- Evidence: 目前仅有纯函数 `resolveTheme` 单测，UI 渲染与状态变化仍依赖端到端/人工检查。
- Dependencies: 安装 `@testing-library/react` 与 `happy-dom` 或 `jsdom`，配置 `vitest.config.ts` 环境。
- Completion signal: 新增组件单测并通过 `pnpm test:unit`。

## Later

### 测试覆盖率统计报告
- Value: 在 CI 或本地可视化分析核心工具代码（scripts、lib）的行覆盖率与分支覆盖率。
- Evidence: 当前未配置 `@vitest/coverage-v8`。
- Dependencies: 引入 `@vitest/coverage-v8` 并配置阈值。
- Completion signal: `pnpm test --coverage` 可正常生成报告。
