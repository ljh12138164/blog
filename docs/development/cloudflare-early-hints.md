# Cloudflare 103 Early Hints

## Background

The blog is exported as static HTML, served by container Nginx, proxied through the repository-managed host Nginx, and published behind Cloudflare. Cloudflare only generates cached `103 Early Hints` for eligible responses that contain `Link` response headers with `preload` or `preconnect` relations. HTML `<link>` elements alone do not establish that origin response contract.

The original implementation included explicit preconnect hints for third-party origins already used by the site. A later SEO audit reported excessive preconnects, so the current root layout retains only DNS-prefetch for those deferred scripts while the generator keeps its explicit-preconnect capability for future intentional use.

## Scope

- Generate deterministic, route-specific Nginx `Link` header mappings from the static HTML export.
- Preload exported page stylesheets and retain explicitly authored preconnect hints when present.
- Exclude script preloads, DNS prefetch hints, error pages, and inferred resources.
- Serve the generated `Link` headers from the container Nginx without changing cache or security headers.
- Package the generated mapping in the Docker image and verify it in CI.
- Document the required Cloudflare dashboard setting and production verification procedure.
- Preserve and include the existing `app/layout.tsx`, `next-env.d.ts`, and generated-artifact working-tree changes as requested.
- Preserve the user's intentional deletions of `CONTEXT.md`, `MISSION.md`, `NOTES.md`, `RESOURCES.md`, and `skills-lock.json` in the same pull request, as explicitly confirmed during final review.
- Rewrite the existing Early Hints article as a reproducible implementation guide and include the confirmed production `103` response screenshot.
- Include the complete production map generator in the article and remove question-style self-check sections from all posts, as requested.

## Out of scope

- Enabling the Cloudflare dashboard setting through credentials or infrastructure automation.
- Deploying to production as part of this pull request task.
- Preloading analytics, advertising, or low-priority Next.js scripts.
- Adding a Cloudflare Worker or changing the host Nginx proxy boundary.

## Acceptance criteria

- Root and extensionless exported routes map to their current build's stylesheet preload hints.
- Explicit preconnect hints, if authored, are preserved, deduplicated, and emitted with applicable `crossorigin` semantics; the current export intentionally authors none.
- Script preload and DNS-prefetch hints are absent from the generated mapping.
- The generated mapping is deterministic and safe to include in Nginx configuration.
- Container Nginx returns a `Link` header for mapped HTML routes and omits it for unmapped assets.
- Existing cache, security, health-check, route, static export, Pagefind, sitemap, and SEO behavior continues to pass verification.
- Deployment documentation explains Cloudflare enablement, warm-up behavior, HTTP/2 or HTTP/3 requirements, and the non-deterministic nature of observing a cached `103` response.

## Feasibility

Conditionally feasible. The repository can generate and serve the required final-response `Link` headers. Actual `103` emission additionally requires Early Hints to be enabled for the Cloudflare zone, an eligible HTTP/2 or HTTP/3 client, and a populated Cloudflare Early Hints cache. Cloudflare can intentionally suppress or omit `103` for some user agents or when the main response headers arrive first, so CI will verify the stable origin contract rather than require a `103` on every request.

The container Nginx already owns static response headers, while the host Nginx proxies upstream response headers by default and does not hide `Link`. Build-time generation avoids hard-coding Next.js asset hashes. A Node.js standard-library generator avoids a new runtime dependency.

Remote fetch failed twice because GitHub was unreachable. On 2026-08-28 the user explicitly confirmed that local `master` commit `b4e6c9c` is the current baseline and authorized creating the feature branch from it.

## Implementation

- The Node.js generator parses exported `<link>` elements without depending on attribute order, converts stylesheets to `rel=preload; as=style`, retains intentionally authored preconnects, and excludes scripts, DNS prefetches, and generated error pages. The current root layout contains no preconnects after the later audit correction.
- `out/index.html` maps to `/`; other exported `.html` files map to extensionless request URIs. The generated Nginx configuration first derives a query-free path from `$request_uri`, then maps that stable public path to `$early_hints_link`. This avoids losing the mapping when `try_files` internally rewrites `$uri` to an `.html` file.
- The postbuild step writes `.next/early-hints-map.conf`. The Docker runtime copies that exact build artifact into `conf.d` alongside the matching static export.
- Container Nginx adds the mapped `Link` header only in HTML-serving locations. Empty map values omit the header for assets, health checks, and unmapped error responses.
- CI runs the focused generator tests, requires the generated map, and verifies the final public deployment response contains a stylesheet preload Link header.
- Pull-request CI builds and starts the runtime image, verifies HTML routes with query strings, checks the extracted stylesheet asset and health endpoint remain free of page-level Link headers, and production verification isolates the final HTTP response block from any preceding cached `103` block.

## Verification

Completed locally:

- `pnpm test:early-hints`: passed, 4 tests covering routes, stylesheets, preconnects, excluded hints, error pages, deterministic ordering, escaped route keys, and duplicate normalized routes.
- `pnpm typecheck`: passed.
- `pnpm build`: passed, exporting 42 static pages; Pagefind indexed 38 pages; sitemap and SEO verification passed.
- Required artifacts exist, including `.next/early-hints-map.conf`; the current export generated 39 eligible route mappings.
- `docker compose config`: passed.
- `nginx -t` against `nginx:1.29-alpine` with the generated map, runtime configuration, and static export mounted read-only: passed.
- Runtime response checks passed for `/` and `/posts/cloudflare-http3-early-hints`, including query strings: both returned the expected stylesheet preload and explicit preconnect `Link` header. A static CSS asset and `/healthz` omitted the page-level header.
- Production observation confirmed an `HTTP/2 103` block followed by the final `HTTP/2 200`; the implementation article includes that captured response.
- The generated article references the hashed screenshot asset, and workflow YAML parses successfully.
- The follow-up `pnpm test:resource-hints` verifies the current static export contains four DNS-prefetch hints, no preconnect hints, and still emits stylesheet preload Early Hints.

Final fresh verification:

```bash
pnpm test:early-hints
pnpm test:resource-hints
pnpm typecheck
pnpm build
git diff --check
```

`docker build -t blog:early-hints .` could not reach the Dockerfile stages because this workstation's configured Tencent registry mirror returned 404 while resolving `node:22-alpine`. The locally cached Nginx image was sufficient to verify syntax and actual response behavior. GitHub Actions performs the full image build on its Linux runner.

Independent review completed with no remaining Critical or Important findings. All review findings were resolved in the branch; there are no accepted follow-ups requiring a roadmap.

## Risks

- Aggressive script preloads could compete with critical CSS, so scripts are excluded.
- Next.js asset hashes change between builds, so mappings must be generated from the same build copied into the image.
- Nginx `add_header` inheritance can be interrupted by location-level cache headers, so the mapped header must be applied in the HTML-serving locations explicitly.
- A successful origin response-header check proves Cloudflare readiness but not deterministic `103` emission; production observation remains a post-deployment check.
