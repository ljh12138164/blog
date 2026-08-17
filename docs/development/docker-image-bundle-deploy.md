# Docker image bundle deployment

## Background

The static-file deployment removed Docker even though the repository must continue to own its container, Nginx, and deployment configuration. The 2 GB production server must not build application artifacts or pull from GHCR.

## Scope

- Build a tagged Docker image in GitHub Actions and transfer it as part of a release bundle over the existing restricted SSH command.
- Restore repository-managed Docker, Compose, and container Nginx files.
- Make the server load the transmitted image locally, apply versioned deployment configuration, run Compose without pulling a registry image, and roll back the previous release on failed health checks.
- Document the one-time server bootstrap and ongoing release workflow.

## Out of scope

- Publishing to GHCR or GitHub Packages.
- Building application code on the production server.
- Automatic pull-request merge, branch deletion, or production publication from this branch.

## Acceptance criteria

- No workflow step logs in to, pushes to, pulls from, or requires GHCR.
- A successful release transfers an immutable `blog:sha-<commit>` Docker image and the repository-managed Compose, Nginx, and deployment configuration through the restricted SSH command.
- Compose never pulls a remote image; it starts the image loaded from the release bundle.
- On health-check failure, the server returns to the preceding image tag and configuration snapshot.
- `pnpm typecheck`, `pnpm build`, static artifact checks, `docker compose config`, a local image build, shell syntax checks, and `git diff --check` pass before PR publication.

## Implementation

- Restored the repository Docker runtime: multi-stage Dockerfile, container Nginx, Docker ignore rules, and local-only Compose image reference.
- Replaced static release switching with a bundle-aware server script that imports `image.tar`, snapshots managed configuration, syncs the bundle, and restores the previous configuration and tag after health-check failure.
- Replaced the Actions static archive upload with immutable image build, `docker save`, and bundle streaming through the existing restricted SSH command.
- Recorded the durable deployment boundary in ADR 0003 and marked the direct-static ADR as superseded.

## Verification

- Passed: `docker compose config` renders the local `blog:latest` image with `pull_policy: never`.
- Passed: `pnpm typecheck`, `NEXT_PUBLIC_SITE_URL=http://60.205.171.159 pnpm build`, and required `out/` artifacts (`index.html`, Pagefind, sitemap, robots).
- Passed: `bash -n deploy/server/deploy-blog`, `bash -n deploy/server/blog-deploy-gate`, workflow YAML parsing, no-registry workflow scan, and `git diff --check`.
- Blocked locally: `docker build --build-arg NEXT_PUBLIC_SITE_URL=http://60.205.171.159 -t blog:local .` cannot connect because Docker Desktop's Linux engine is not running on this workstation. The deploy workflow performs the same build on GitHub-hosted Linux runners.

## Risks

- The server needs a one-time bootstrap installation of the bundle-aware restricted deployment script before the first workflow run.
- Docker image archives require temporary disk space on the GitHub runner and server, though server memory is not used for an application build.
- The first production release requires the documented root-only bootstrap before the bundle-aware forced command can accept standard input.
