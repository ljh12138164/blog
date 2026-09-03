# Hermes

## 状态

已完成：`feat/vitest-migration` 分支已完成测试体系向 Vitest 的全面迁移与用例重写。
- 4 个测试套件（`lib/theme.test.ts`、`scripts/generate-early-hints.test.mjs`、`scripts/submit-indexnow-urls.test.mjs`、`scripts/resource-hints.test.mjs`）共 11 个用例全部重写并通过 Vitest 验证。
- 本地完整执行并通过 `pnpm test:unit`、`pnpm test`、`pnpm check`、`pnpm typecheck`、`pnpm build` 及 `pnpm test:resource-hints`。
- 新增 `vitest.config.ts`、开发文档 `docs/development/vitest-migration.md` 与演进路线图 `docs/roadmaps/vitest-migration.md`。
- 分支已推送到远端：`origin/feat/vitest-migration`。

## 下一步

Pull Request 链接：<https://github.com/ljh12138164/blog/pull/new/feat/vitest-migration>。
请在 GitHub 打开并创建 PR，等待 CI 的 `verify` 任务验证完成后即可合并。
