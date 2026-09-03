# Hermes

## 状态

进行中：已检出特性分支 `feat/vitest-migration`，完成可行性与瓶颈评估，已建立开发文档 `docs/development/vitest-migration.md`。正在引入 `vitest` 并重写所有测试用例。

## 下一步

1. 安装 `vitest` 并创建 `vitest.config.ts`。
2. 重写 `lib/theme.test.ts`、`scripts/generate-early-hints.test.mjs`、`scripts/submit-indexnow-urls.test.mjs` 和 `scripts/resource-hints.test.mjs`。
3. 更新 `package.json` 脚本与 `.github/workflows/ci-deploy.yml`。
4. 执行完整验证（测试、类型检查、构建及 CI 流程检查）。
5. 提交代码并根据 develop-with-pr 规范发起 Pull Request。
