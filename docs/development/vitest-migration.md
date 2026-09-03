# 迁移测试用例至 Vitest

## Background

当前项目的单元测试与构建产物验证用例主要基于 Node.js 原生测试运行器（`node:test` + `node:assert/strict`）及实验性参数 `--experimental-strip-types`。
为提升测试开发体验、统一断言与报告格式、原生支持 TypeScript 与 ESM，现按照规范将测试体系迁移至 Vitest，并重写全部测试用例。

后续路线见 [Vitest 迁移与测试演进 roadmap](../roadmaps/vitest-migration.md)。

## Scope

- 安装 `vitest` 为开发依赖，创建 `vitest.config.ts` 配置文件。
- 重写所有测试用例为 Vitest 语法（`describe`, `it`, `expect`）：
  - `lib/theme.test.ts`
  - `scripts/generate-early-hints.test.mjs`
  - `scripts/submit-indexnow-urls.test.mjs`
  - `scripts/resource-hints.test.mjs`
- 优化本地测试服务器的生命周期清理，防止异步句柄泄露。
- 更新 `package.json` 中的测试脚本，保留向后兼容的独立脚本，并提供全局与单元测试脚本。
- 在 CI 流程中补齐此前缺失的 `test:theme`，并验证所有步骤。

## Out of scope

- 业务代码逻辑重构或功能改动。
- 引入除 Vitest 外的其他测试库或复杂的 DOM 模拟工具。
- 修改 Nextra 页面渲染和静态导出机制。

## Acceptance criteria

- `pnpm test` 及各个细粒度测试命令均能正常运行并通过。
- 所有用例采用 Vitest 的 BDD 风格断言与生命周期，无 `node:test` 残留引用。
- `pnpm typecheck` 与 `pnpm check` 保持无任何类型或代码风格报错。
- `pnpm build` 与构建后产物测试 `pnpm test:resource-hints` 正常通过。
- CI 校验文件同步更新并通过验证。

## Feasibility

结论：可行。
现有项目为 ESM 模块（`type: module`），Next.js 16 与 TypeScript 5.9，环境完全兼容 Vitest。
核心注意点在于区分构建前即可独立执行的单元测试与依赖静态导出产物的 `test:resource-hints`。

## Implementation

- 安装 `vitest`（v4.1.11），在根目录创建 `vitest.config.ts` 配置 `node` 测试环境与 `@/` 别名。
- 重写 `lib/theme.test.ts`，从 `vitest` 导入 `describe`, `it`, `expect`，测试系统与持久化主题解析。
- 重写 `scripts/generate-early-hints.test.mjs`，转换为 Vitest 风格并优化异常抛出断言。
- 重写 `scripts/submit-indexnow-urls.test.mjs`，通过显式 `closeServer` 保证本地 HTTP 测试服务器无论断言成功与否均可靠关闭。
- 重写 `scripts/resource-hints.test.mjs`，接入 Vitest 断言并加入产物友好诊断提示。
- 在 `package.json` 中配置 `test`、`test:unit` 及 4 个独立的 `test:*` 脚本，保障 CI 与日常维护向后兼容。
- 在 `.github/workflows/ci-deploy.yml` 的 `verify` 任务中新增 `pnpm test:theme`。
- 更新 `README.md` 中的测试运行说明。

## Verification

- `pnpm test:theme`：通过（1 个测试文件，2 个用例全部通过）。
- `pnpm test:early-hints`：通过（1 个测试文件，4 个用例全部通过）。
- `pnpm test:indexnow-submit`：通过（1 个测试文件，4 个用例全部通过）。
- `pnpm test:unit`：通过（3 个测试文件，10 个单元测试用例全部通过）。
- `pnpm check`：通过（Biome 检查 37 个文件，0 错误）。
- `pnpm typecheck`：通过（TypeScript 5.9 编译通过，0 错误）。
- `pnpm build`：通过（Next.js 静态构建 44 个路由，Pagefind 索引 39 页，SEO 校验通过）。
- `pnpm test:resource-hints`：通过（1 个测试文件，1 个构建产物验证用例通过）。
- `pnpm test`：通过（4 个测试文件，11 个用例全部通过，耗时约 790ms）。

## Risks

- `scripts/resource-hints.test.mjs` 依赖 `out/index.html` 与 `.next/early-hints-map.conf`。在全新检出且未构建的环境下运行全局 `vitest run` 时，该用例会因文件不存在而失败。已通过区分 `test:unit`、提供友好提示和在文档中明确测试执行顺序降低此风险。
