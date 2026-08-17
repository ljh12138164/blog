# Direct static deployment

## Background

The blog is a static export, but production deployment currently builds an image in GitHub Actions, stores it in GHCR, and has the server pull it. The server has 2 GB of memory and should not build the site.

## Scope

- Replace GHCR image publishing with GitHub Actions uploading the verified static export through the existing restricted SSH account.
- Install the archive into commit-addressed server release directories and atomically switch the active release.
- Update the host Nginx configuration, deployment scripts, and documentation for direct static hosting.
- Remove Docker files that become obsolete, including the user-provided Node 24 Dockerfile change.
- Update `develop-with-pr` so an explicitly user-confirmed local baseline can be used when fetching is externally unavailable.

## Out of scope

- Production installation or publication.
- Server-side Node.js builds.
- Automatic PR merge or branch deletion.

## Acceptance criteria

- The workflow never logs in to, pushes to, or pulls from GHCR.
- A successful `master` run uploads only the verified static output and asks the server to deploy its immutable `sha-<commit>` release.
- The server validates required static files before atomically switching `current`, verifies `/healthz`, and restores the prior release when health checking fails.
- Public Nginx serves the active static release directly.
- Documentation describes setup, deployment, rollback, and required GitHub configuration.

## Implementation

- 在同一个受限 SSH 命令中通过标准输入流式传输 `out/` 压缩包，避免给部署用户开放 shell 或 SFTP。
- 服务器脚本校验静态文件、将新版本放入 `releases/sha-<commit>`，再原子切换 `current`；健康检查失败时恢复上一 release。
- 移除 Docker、Compose、GHCR 工作流与容器 Nginx 配置，宿主 Nginx 改为直接提供 `current`。
- 以 ADR 0002 记录此长期部署边界，并替代旧的容器 ADR。

## Verification

- `develop-with-pr` Skill condition test: passed after the minimal rule change.
- `quick_validate.py .agents/skills/develop-with-pr`: passed with `python -X utf8`.
- Remote `git fetch origin master --prune`: blocked by a GitHub connection reset; the user explicitly confirmed the local baseline is current.
- `bash -n deploy/server/deploy-blog` and `bash -n deploy/server/blog-deploy-gate`: passed after normalizing the deployment scripts to LF.
- `pnpm typecheck`: passed.
- `pnpm build`: passed outside the filesystem sandbox; the sandboxed run is blocked because Turbopack cannot read its inferred `C:\\Users\\PC` workspace root.
- Required static files exist after the build: passed.
- `git diff --check`: passed.

## Risks

- The server must be prepared with the new static release script and Nginx configuration before the modified workflow is merged.
- GitHub connectivity must be available later to push the branch and create the PR.
