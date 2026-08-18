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
6. **Conduct design review with `grill-with-docs`**
   - Run `/grill-with-docs` against the proposed changes and the existing domain model.
   - The skill will ask forcing questions to uncover assumptions, edge cases, and terminology mismatches.
   - Answer all questions. The skill automatically updates `CONTEXT.md` and creates ADRs as decisions crystallize.
   - If the design review reveals the proposal is fundamentally flawed or out of scope, stop and report to the user; do not proceed with implementation.
7. **Create the development document** at `docs/development/<short-kebab-name>.md`, populating it with the outcomes of the design review:
   - Background
   - Scope
   - Out of scope
   - Acceptance criteria
   - Implementation decisions
   - Risks
   (These sections may be directly copied or adapted from the design review output and ADRs.)
8. Record the active objective and next action in `/HERMES.md`.

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
