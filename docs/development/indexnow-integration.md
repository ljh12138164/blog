# Replace Baidu URL submission with IndexNow

## Background

The static blog already publishes `sitemap.xml` and previously notified Baidu after a verified production deployment. Replace that provider-specific token flow with the open IndexNow protocol and its public root key. Related design: [IndexNow integration design](../superpowers/specs/2026-08-28-indexnow-integration-design.md).

## Scope

- Remove the Baidu submission script, tests, workflow command, and secret documentation.
- Export the supplied IndexNow key at the site root.
- Add a tested script that reads the live sitemap and submits unique same-site URLs to the IndexNow global endpoint.
- Run focused tests in verification jobs and submit only after public production verification.
- Document local verification and production behavior.
- Remove all third-party `preconnect` hints while retaining `dns-prefetch` and stylesheet preload Early Hints.
- Shorten the five reported article titles in page, Open Graph, and Twitter metadata.

## Out of scope

- Google Indexing API, because this `TechArticle` blog does not meet Google's supported structured-data types.
- Per-route Git diff analysis, deleted-URL discovery, retries, scheduled submission, or search-engine verification automation.
- Changes to runtime serving, sitemap generation, article bodies, or page layout.
- Title rewrites outside the five reported routes.

## Acceptance criteria

- `https://blog.ljhboard.cn/0fa033ea117044e3a4f36a35f8e87c0f.txt` is produced by the static export and contains exactly the supplied key.
- Pull-request CI tests URL extraction and IndexNow request behavior without contacting a production endpoint.
- Production CI submits the live sitemap only after deployment and public checks succeed.
- Requests contain the correct host, key, key location, and no more than 10,000 unique same-site URLs.
- Baidu submission code and `BAIDU_PUSH_TOKEN` references are absent.
- Exported pages contain no explicit third-party `preconnect`; the existing four external origins retain `dns-prefetch`, and CSS Early Hints remain `rel=preload; as=style`.
- The five reported routes render the approved shorter titles consistently in page, Open Graph, and Twitter metadata.
- Project typecheck and static build pass with all required artifacts.

## Feasibility

Feasible. The repository already has the necessary deployment seam, Node.js runtime in Actions, live sitemap, static public directory, and a prior tested URL-submission pattern. No dependency or runtime service is required.

The main operational constraint is ownership validation: the key file must be live before the POST is sent. Keeping submission after public deployment verification enforces that ordering. IndexNow accepts up to 10,000 URLs per request, well above the current sitemap size. The key is deliberately public and must not be stored as an Actions Secret.

Google's Indexing API was investigated and rejected for this scope because it only supports `JobPosting` and `BroadcastEvent` embedded in `VideoObject`. The existing sitemap remains the correct Google discovery mechanism.

## Implementation

The provider-specific implementation contains one public key file and one Node.js module/CLI. The module reuses the prior sitemap entity decoding and same-site filtering behavior, adds the IndexNow JSON schema and 10,000 URL limit, accepts documented `2xx` outcomes, and never logs upstream response bodies.

The production workflow verifies the exported key during CI, verifies the public root key after deployment, and invokes IndexNow only after the public deployment checks pass. No search credential or new dependency is required.

The root layout now retains four DNS-prefetch hints but no third-party preconnects. Static-output regression coverage confirms CSS remains represented by stylesheet preload Early Hints. The five reported article metadata title triplets were shortened without changing descriptions, bodies, canonical URLs, or archive labels; generated LLM indexes were refreshed from the same metadata.

The first local Docker verification failed because the repository had no `.dockerignore`: the 1.15 GB context copied Windows `node_modules` over dependencies installed in the Linux builder. A build-context boundary now excludes local dependencies, generated output, Git/worktree metadata, environment files, and local secrets. This is a verification blocker fix, not a runtime architecture change.

## Verification

Completed focused cycles:

- `node --test scripts/submit-indexnow-urls.test.mjs` failed because the module did not exist, then `pnpm test:indexnow-submit` passed 4 tests after the minimal implementation.
- `node --test scripts/resource-hints.test.mjs` failed against the existing four exported preconnects, then passed after removal and a fresh build.
- `pnpm test:early-hints` passed 4 tests after the resource-hint change.
- `pnpm build` passed, exported 42 pages, indexed 38 pages with Pagefind, and generated the sitemap, robots file, SEO verification, key file, and Early Hints map.
- The five final built document titles are 35–53 characters including the site-name suffix.

Final verification completed:

```bash
pnpm test:indexnow-submit
pnpm test:early-hints
pnpm typecheck
pnpm build
docker compose config
docker build -t blog:local .
git diff --check
```

The build must produce `out/index.html`, `out/_pagefind/pagefind.js`, `out/sitemap.xml`, `out/robots.txt`, `.next/early-hints-map.conf`, and the root IndexNow key file.

Results:

- `pnpm test:indexnow-submit`: 4 passed.
- `pnpm test:resource-hints`: 1 passed against the final static output.
- `pnpm test:early-hints`: 4 passed.
- `pnpm check`: passed, 28 files checked with no fixes.
- `pnpm typecheck`: passed.
- `pnpm build`: passed, 42 static pages generated; Pagefind indexed 38 pages; sitemap and SEO verification passed.
- Required artifacts and the byte-for-byte exported IndexNow key were verified.
- GitHub workflow YAML parsed successfully.
- `docker compose config`: passed.
- The first `docker build -t blog:local .` reproduced the missing-`.dockerignore` dependency overwrite. After adding the build-context boundary, the same command passed and produced `blog:local`; context transfer fell from 1.15 GB to 36 KB.
- `git diff --check`: passed before final documentation updates and is rerun at the completion gate.

The completed diff was reviewed against repository standards and this document's acceptance criteria. No blocking finding remains. The Docker context issue was resolved in the branch; no accepted follow-up remains, so no roadmap is required.

## Risks

- Receipt does not guarantee indexing.
- Complete-sitemap submission is intentionally broader than change-only submission; exact diff mapping is deferred.
- Notification failure occurs after deployment and therefore cannot imply that production rolled back.
- Docker builds intentionally omit Git metadata, so Nextra logs a non-blocking repository-discovery warning inside the isolated builder; static output and metadata verification pass without it.
- Review identified no accepted follow-up; no roadmap is required.
