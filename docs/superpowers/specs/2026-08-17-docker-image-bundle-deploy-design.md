# Docker Image Bundle Deployment Design

## Goal

Deploy the static blog as Docker on the 2 GB ECS instance without a registry: GitHub Actions builds the image and securely transfers it, while the server only imports and runs it.

## Architecture

The Actions deploy job builds `blog:sha-<commit>`, saves it as `image.tar`, and combines it with `compose.yaml`, container Nginx, host Nginx, and restricted deployment files in a compressed release bundle. The existing forced SSH command accepts only `deploy sha-<commit>` and passes standard input to the root deployment script.

The server validates the tag and bundle layout, imports the image with `docker load`, copies the tracked configuration into the blog stack, writes `IMAGE_TAG`, validates and reloads the host Nginx configuration, then runs `docker compose up -d`. Compose uses `pull_policy: never`, so it can only start the locally imported `blog:sha-<commit>` image.

## Release and rollback

Before applying a bundle, the deployment script saves the active tag and managed configuration under `/opt/stacks/blog/backups/<release-id>`. It waits for `http://127.0.0.1:18080/healthz`; on failure it restores that configuration snapshot, rewrites the former tag, brings Compose back up, and verifies health before reporting the failed deployment.

The release bundle is the source of truth for the tracked deployment configuration after the one-time bootstrap. The initial bootstrap remains a root-only Workbench operation because the presently installed static-release gate cannot consume a Docker image bundle.

## Security and constraints

- The workflow uses the existing SSH private key and known-hosts secret; the deploy account remains restricted to one `deploy sha-<40 hex>` command and has no shell or SFTP access.
- No GitHub Packages, GHCR login, image push, image pull, or server-side application build is performed.
- The host Nginx remains a Baota-managed reverse proxy to `127.0.0.1:18080`; the container Nginx is maintained in this repository.
- A release archive and imported image use temporary disk space, but the 2 GB server does not run Node.js or Docker builds.

## Verification

The repository will verify the workflow YAML, shell syntax, static export, Compose configuration, and a local Docker image build. The first production rollout additionally requires Workbench bootstrap and an on-server health check.
