# 建立开发任务工作流

## Background

项目已有内容维护和部署规范，但尚未统一产品开发需求的分支、文档、验证与 Pull Request 流程。

## Scope

- 新增项目级 `develop-with-pr` Skill。
- 规定干净工作区、`feat/*` 分支和开发文档的启动流程。
- 规定验证、提交、PR 创建与 CI 失败修复流程。
- 明确 PR 由用户在 GitHub 审阅并手动合并。
- 在项目词汇表中定义“开发任务”和“开发文档”。

## Out of scope

- 自动合并 Pull Request。
- 自动删除远程分支。
- 修改现有 CI/CD 流水线。
- 强制纯文案、纯文档或紧急生产排障使用该流程。

## Acceptance criteria

- Skill 能在功能、Bug 修复、重构和性能需求时被发现。
- Skill 要求从最新默认分支创建 `feat/<短名>`，且不自动处理已有改动。
- 每项开发任务在编码前创建对应的 `docs/development/<短名>.md`。
- PR 必须包含开发文档、主要变更、验证结果和风险，并等待 CI 通过。
- Skill 明确禁止自动合并，且通过官方校验器验证。

## Implementation

- 使用官方 `skill-creator` 初始化 `.agents/skills/develop-with-pr`。
- 将完整流程保留在 `SKILL.md`，不增加不必要的脚本或参考文件。
- 使用 `agents/openai.yaml` 提供 Skill 的 UI 名称、简介和默认提示。

## Verification

- 官方 Skill 校验器：通过（`Skill is valid!`）。
- `pnpm typecheck`：通过。
- `pnpm build`：通过；静态导出完成，Pagefind 索引 4 个页面，sitemap 生成成功。
- `git diff --check`：通过。
- GitHub Actions `CI and Deploy`：通过。
- Pull Request：[PR #1](https://github.com/ljh12138164/blog/pull/1)。

## Risks

- 流程依赖 GitHub 凭据和远程仓库可用；无法访问时应保留本地分支并明确记录阻塞。
- 本次改动不修改运行时代码，生产站点行为不受影响。
