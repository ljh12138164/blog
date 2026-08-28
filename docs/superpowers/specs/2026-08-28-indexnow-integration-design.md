# IndexNow integration design

## Context

The production workflow currently deploys a static Nextra export and verifies the public site before notifying Baidu of every URL in the live sitemap. The Baidu token integration is being removed and replaced with IndexNow using the public ownership key supplied for `https://blog.ljhboard.cn`.

Google's Indexing API is not part of this design. Google restricts that API to pages carrying `JobPosting` or `BroadcastEvent` embedded in `VideoObject`; this blog publishes `TechArticle` pages and must continue using its sitemap and Search Console for Google discovery.

## Goals

- Host the IndexNow ownership key at the production site root.
- Notify the IndexNow global endpoint only after a production deployment passes public verification.
- Submit the live sitemap's unique, same-origin URLs in one UTF-8 JSON request.
- Replace the Baidu-specific script, tests, workflow step, secret documentation, and commands.
- Make protocol and filtering failures visible in GitHub Actions without exposing private credentials.

## Out of scope

- Google Indexing API integration.
- Detecting individual changed or deleted routes from Git history.
- Guaranteeing that a participating search engine crawls or indexes a submitted URL.
- Deployment, Search Console, or Bing Webmaster Tools automation.
- A reusable multi-provider search submission abstraction.

## Architecture

The UTF-8 file `public/0fa033ea117044e3a4f36a35f8e87c0f.txt` contains the matching public key so Next.js exports it at the site root. The key is public proof of host ownership, not a secret, and therefore requires no GitHub Actions Secret.

After the existing public deployment checks pass, `scripts/submit-indexnow-urls.mjs` reads `site.config.json`, fetches the live `/sitemap.xml`, retains only valid URLs under the configured site origin and path, removes duplicates, and submits the resulting list to `https://api.indexnow.org/indexnow`. The JSON payload contains `host`, `key`, `keyLocation`, and `urlList`.

Pull requests run the focused unit tests but never contact IndexNow. The production workflow invokes the script only after deployment. A non-success response fails the notification step and leaves the already deployed site running; deployment rollback is not triggered by this post-deployment notification.

## Interfaces and behavior

The module exposes pure sitemap URL extraction and an injectable submission function for tests. The CLI uses the production endpoint and live sitemap by default. Tests inject a local HTTP endpoint and fixture sitemap so they never contact a search engine.

The submission rejects an empty eligible URL list before making a request. It treats any HTTP `2xx` response as accepted and reports only the number of submitted URLs. For non-`2xx` responses it reports the HTTP status without echoing response bodies. URLs outside the configured origin or base path and malformed sitemap entries are excluded.

The implementation sends at most 10,000 URLs, the protocol's documented per-request maximum. This blog is far below that limit; exceeding it is an explicit error rather than silently truncating coverage.

## Verification

- Unit tests prove same-site filtering, XML entity decoding, deduplication, the JSON payload, successful `2xx` handling, empty-list rejection, the 10,000 URL limit, and non-success handling.
- `pnpm typecheck` passes.
- `pnpm build` exports the key file, sitemap, robots file, Pagefind index, and existing Early Hints map.
- CI verifies the exported key file exists and matches the tracked public key file.
- `git diff --check` reports no whitespace errors.

## Risks

- IndexNow submission confirms receipt, not indexing. Bing Webmaster Tools remains the place to verify receipt and search coverage.
- Re-submitting the complete sitemap on each production deployment is less precise than change-only notification. It is intentionally retained as the smallest reliable replacement for the existing deployment flow; exact route-change detection is deferred unless deployment frequency or rate limiting makes it necessary.
- A `403` indicates that the public key cannot be validated; public deployment verification must therefore precede submission.
- A `429` indicates rate limiting. The workflow should surface it rather than retry aggressively and risk further throttling.

## Sources

- [IndexNow protocol documentation](https://www.indexnow.org/documentation)
- [IndexNow FAQ](https://www.indexnow.org/faq)
- [Bing IndexNow setup](https://www.bing.com/indexnow/getstarted)
- [Google Indexing API usage restrictions](https://developers.google.com/search/apis/indexing-api/v3/using-api)

