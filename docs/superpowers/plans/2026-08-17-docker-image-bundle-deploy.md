# Docker Image Bundle Deployment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deploy the blog with a Docker image built in GitHub Actions and loaded locally on ECS, without GHCR or GitHub Packages.

**Architecture:** The deploy job creates `blog:sha-<commit>`, saves it with repository-managed Docker and Nginx configuration into a tar stream, and sends it through the restricted SSH command. The server validates, imports, applies, starts, health-checks, and rolls back the local Compose release.

**Tech Stack:** GitHub Actions, Docker/Compose, POSIX shell, Baota Nginx, pnpm.

**Spec:** `docs/superpowers/specs/2026-08-17-docker-image-bundle-deploy-design.md`

## Global Constraints

- The production server has 2 GB memory and must not build application code or Docker images.
- The deploy account accepts only `deploy sha-<40 lowercase hex>` through a forced SSH command.
- No GHCR login, pull, push, GitHub Packages, or remote-image pull is allowed.
- Tracked deployment and Nginx configuration is synchronized with every release bundle.

---

### Task 1: Restore the local Docker runtime contract

**Files:** Create `Dockerfile`, `.dockerignore`, `deploy/nginx.conf`; modify `compose.yaml`.

- [ ] Write the failing runtime contract: `compose.yaml` must use `image: blog:${IMAGE_TAG:-latest}` and `pull_policy: never`.
- [ ] Run `test -f Dockerfile && docker compose config`; expect failure because the static baseline has no Dockerfile and no local-only image.
- [ ] Restore the multi-stage Dockerfile, container Nginx, Docker ignore list, and Compose health check with the required image and no-pull policy.
- [ ] Run `docker compose config && docker build --build-arg NEXT_PUBLIC_SITE_URL=http://60.205.171.159 -t blog:local .`; expect a successful local image build.
- [ ] Commit: `git add Dockerfile .dockerignore compose.yaml deploy/nginx.conf && git commit -m "feat: restore local Docker runtime"`.

### Task 2: Implement server-side bundle deployment and rollback

**Files:** Modify `deploy/server/deploy-blog`, `deploy/server/blog-deploy-gate`, and `deploy/server/blog-deploy.sudoers`.

- [ ] Write the required input contract: gzip standard input contains `image.tar`, `compose.yaml`, `deploy/host-nginx.conf`, and the three deployment files.
- [ ] Run `bash -n deploy/server/deploy-blog && rg 'docker load|image.tar' deploy/server/deploy-blog`; expect the search to fail because the static script cannot import an image archive.
- [ ] Implement extraction, required-file validation, `docker load -i image.tar`, managed-file and tag snapshotting, configuration installation, Nginx validation/reload, local Compose startup, health check, and snapshot restoration on failure.
- [ ] Run `bash -n deploy/server/deploy-blog && bash -n deploy/server/blog-deploy-gate && rg 'docker load|image.tar|pull_policy: never' deploy/server/deploy-blog compose.yaml`; expect success.
- [ ] Commit: `git add deploy/server/deploy-blog deploy/server/blog-deploy-gate deploy/server/blog-deploy.sudoers && git commit -m "feat: deploy Docker image bundles locally"`.

### Task 3: Package and transmit releases in GitHub Actions

**Files:** Modify `.github/workflows/ci-deploy.yml`.

- [ ] Write the workflow contract: build `blog:$RELEASE_TAG`, use `docker save`, include all tracked configuration, and have no GHCR or registry operations.
- [ ] Run `rg 'tar -C out|ghcr.io|docker save' .github/workflows/ci-deploy.yml`; expect the static upload but no `docker save`.
- [ ] Build the immutable local image in the deploy job, stage `image.tar` and tracked files at required bundle paths, and pipe a compressed bundle to `ssh ... "deploy $RELEASE_TAG"`.
- [ ] Run `! rg -n 'ghcr.io|docker/login-action|docker (push|pull)' .github/workflows/ci-deploy.yml && rg -n 'docker build|docker save|image.tar|deploy/server/deploy-blog' .github/workflows/ci-deploy.yml`; expect success.
- [ ] Commit: `git add .github/workflows/ci-deploy.yml && git commit -m "feat: ship Docker image bundles from Actions"`.

### Task 4: Align documentation and verify the release contract

**Files:** Modify `README.md`, `docs/deployment.md`, `CONTEXT.md`, `HERMES.md`, and `docs/development/docker-image-bundle-deploy.md`.

- [ ] Document the root-only initial bootstrap, subsequent Actions synchronization, local image tag, rollback behavior, and GitHub settings. Update stable `CONTEXT.md` vocabulary only for the release model.
- [ ] Run `pnpm typecheck && NEXT_PUBLIC_SITE_URL=http://60.205.171.159 pnpm build && test -f out/index.html && test -f out/_pagefind/pagefind.js && test -f out/sitemap.xml && test -f out/robots.txt && docker compose config && docker build --build-arg NEXT_PUBLIC_SITE_URL=http://60.205.171.159 -t blog:local . && bash -n deploy/server/deploy-blog && bash -n deploy/server/blog-deploy-gate && git diff --check`; expect all checks to pass.
- [ ] Record exact outcomes in the development document and Hermes.
- [ ] Commit: `git add README.md docs/deployment.md CONTEXT.md HERMES.md docs/development/docker-image-bundle-deploy.md && git commit -m "docs: explain Docker image bundle deployment"`.
