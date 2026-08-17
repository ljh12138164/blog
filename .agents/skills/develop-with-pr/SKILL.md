---
name: develop-with-pr
description: Implement product-code or behavior changes through a clean feat branch, a living development document, verified commits, and a GitHub pull request. Use for features, bug fixes, refactors, and performance work; do not require it for copy-only changes, documentation-only updates, or urgent production diagnosis.
---

# Develop with PR

Keep one development task isolated, documented, verified, and reviewable.

## Start or resume

1. Read `/HERMES.md`, `/CONTEXT.md`, and applicable repository instructions.
2. Inspect the branch, worktree, remotes, and existing `docs/development` documents.
3. If resuming a matching `feat/*` branch, continue from its development document and Hermes state.
4. Otherwise require a clean worktree. If unrelated changes exist, stop and ask the user to commit, stash, or discard them; never stash or discard automatically.
5. Fetch the remote default branch and create `feat/<short-kebab-name>` from its latest commit. If fetching is externally unavailable and the user explicitly confirms the local baseline is current, record that confirmation and the fetch failure in the development document, then create the branch from that local baseline. Never develop directly on the default branch.
6. Create `docs/development/<short-kebab-name>.md` before changing product code.
7. Record the active objective and next action in `/HERMES.md`.

## Maintain the development document

Use these sections:

```md
# <Task title>

## Background
## Scope
## Out of scope
## Acceptance criteria
## Implementation
## Verification
## Risks
```

Write scope and testable acceptance criteria before implementation. Keep implementation decisions and verification results current as the work changes. Link durable ADRs instead of duplicating them; create an ADR only for a hard-to-reverse, surprising decision with a real trade-off.

## Implement and verify

1. Make only changes traceable to the documented scope.
2. Follow `/.agents/skills/maintain-blog/SKILL.md` for blog-specific content, SEO, build, and Hermes rules.
3. Run the smallest relevant checks during development, then all repository-required checks before publishing.
4. Record exact commands and outcomes in the development document.
5. Do not publish a PR while required local checks fail. If externally blocked, update the development document and Hermes, then report the blocker.

## Publish the pull request

1. Review the complete diff and confirm no unrelated or secret files are included.
2. Commit intentionally, push the `feat/*` branch, and create a non-draft GitHub PR against the default branch.
3. Use a concise task-focused title. In the PR body include:
   - a link to the development document;
   - the main changes;
   - verification commands and results;
   - known risks or `None`.
4. Wait for GitHub Actions. If a check fails, inspect its logs, fix the cause on the same branch, update the document, push, and wait again.
5. Stop only when all required checks pass or a user/external dependency blocks progress.
6. Never merge or delete the branch. The user reviews and merges the PR manually in GitHub.

## Finish or pause

- On success, place the PR URL and passing-check status in the development document, then reduce Hermes to `状态：空闲` and `下一步：无`.
- On interruption, keep Hermes limited to current state, exact next action, verification status, and blocker; keep task history in the development document and Git.
