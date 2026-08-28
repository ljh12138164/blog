# IndexNow Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Baidu URL submission with IndexNow, remove excessive third-party preconnects, and shorten five reported article titles.

**Architecture:** Keep search notification as a post-deployment Node.js CLI that reads the live sitemap and posts one validated JSON batch to the IndexNow global endpoint. Keep resource-hint and title changes at their existing ownership points: the root layout and each article's metadata export.

**Tech Stack:** Node.js 22 built-in test runner and fetch, Next.js 16 static export, Nextra 4 MDX metadata, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-08-28-indexnow-integration-design.md`

## Global Constraints

- Do not add dependencies or a provider abstraction.
- The IndexNow key is public ownership proof and must not be stored as an Actions Secret.
- Submit only unique URLs under the configured site origin and base path, with a maximum of 10,000 URLs.
- Production notification runs only after public deployment verification.
- Keep the four existing `dns-prefetch` hints and all generated stylesheet preload hints; remove every explicit third-party `preconnect`.
- Change only the approved five article titles, leaving descriptions and bodies untouched.

---

### Task 1: IndexNow protocol module and public key

**Files:**
- Create: `scripts/submit-indexnow-urls.test.mjs`
- Create: `scripts/submit-indexnow-urls.mjs`
- Create: `public/0fa033ea117044e3a4f36a35f8e87c0f.txt`
- Delete: `scripts/submit-baidu-urls.test.mjs`
- Delete: `scripts/submit-baidu-urls.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `extractSiteUrls(sitemap, site): string[]` and `submitIndexNowUrls({ urls, site, key, endpoint? }): Promise<number>`.
- CLI consumes: `site.config.json`, the live `/sitemap.xml`, and the tracked public key constant.

- [ ] **Step 1: Write failing protocol tests**

Create tests that import the not-yet-created module and specify same-origin filtering and XML decoding, an exact JSON POST payload, `2xx` acceptance, empty and over-10,000 rejection, and HTTP failure reporting. The payload assertion must be:

```js
{
  host: 'blog.ljhboard.cn',
  key: 'test-key',
  keyLocation: 'https://blog.ljhboard.cn/test-key.txt',
  urlList: ['https://blog.ljhboard.cn/', 'https://blog.ljhboard.cn/posts/example']
}
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test scripts/submit-indexnow-urls.test.mjs`

Expected: FAIL because `scripts/submit-indexnow-urls.mjs` does not exist.

- [ ] **Step 3: Implement the minimal module and CLI**

Implement the two exported functions with built-in APIs. `extractSiteUrls` decodes XML entities, validates URL origin and base path, removes fragments and duplicates, and returns insertion order. `submitIndexNowUrls` validates count, posts UTF-8 JSON, accepts only `response.ok`, and returns `urls.length`. The CLI reads `site.config.json`, fetches the live sitemap, and logs only the accepted count.

- [ ] **Step 4: Add the public key and package command**

Create the root key file containing exactly `0fa033ea117044e3a4f36a35f8e87c0f` plus a final newline. Replace `test:baidu-submit` with:

```json
"test:indexnow-submit": "node --test scripts/submit-indexnow-urls.test.mjs"
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run: `pnpm test:indexnow-submit`

Expected: all IndexNow tests pass without network access beyond the local test server.

- [ ] **Step 6: Commit the protocol slice**

Stage only the Task 1 files and commit with `feat: 接入 IndexNow 提交协议`.

### Task 2: Resource-hint regression and metadata titles

**Files:**
- Create: `scripts/resource-hints.test.mjs`
- Modify: `app/layout.tsx`
- Modify: `package.json`
- Modify: `app/posts/websocket-edge-functions/page.mdx`
- Modify: `app/posts/git-commit-validation/page.mdx`
- Modify: `app/posts/monorepo-management/page.mdx`
- Modify: `app/posts/markdown-to-html/page.mdx`
- Modify: `app/posts/canvas-library-research/page.mdx`

**Interfaces:**
- The test consumes the root-layout source and enforces the repository's explicit hint contract.
- Article metadata continues to expose Next.js `Metadata` with matching `title`, `openGraph.title`, and `twitter.title`.

- [ ] **Step 1: Write the failing resource-hint test**

Read `app/layout.tsx` and assert that it contains no `rel="preconnect"`, still contains exactly four `rel="dns-prefetch"`, and retains all four approved external origins.

- [ ] **Step 2: Run the resource-hint test and verify RED**

Run: `node --test scripts/resource-hints.test.mjs`

Expected: FAIL because the layout currently contains four `preconnect` links.

- [ ] **Step 3: Remove the four preconnect elements**

Delete only the Cloudflare Insights, Google Tag Manager, Google Analytics, and Google Ads `preconnect` elements. Leave the four `dns-prefetch` elements and scripts unchanged.

- [ ] **Step 4: Update the five metadata title triplets**

Replace each article's top-level, Open Graph, and Twitter title with the exact values in the spec. Do not change descriptions, dates, bodies, canonical URLs, or archive labels.

- [ ] **Step 5: Add and run the focused resource command**

Add `"test:resource-hints": "node --test scripts/resource-hints.test.mjs"`, then run:

```bash
pnpm test:resource-hints
pnpm test:early-hints
```

Expected: both commands pass; stylesheet preload behavior remains covered.

- [ ] **Step 6: Commit the resource and SEO slice**

Stage only the Task 2 files and commit with `fix: 精简资源提示和文章标题`.

### Task 3: Workflow, documentation, and full verification

**Files:**
- Modify: `.github/workflows/ci-deploy.yml`
- Modify: `README.md`
- Modify: `docs/deployment.md`
- Modify: `docs/development/cloudflare-early-hints.md`
- Modify: `docs/development/indexnow-integration.md`
- Modify: `docs/superpowers/specs/2026-08-28-indexnow-integration-design.md`
- Modify: `HERMES.md`

**Interfaces:**
- CI consumes the two focused package scripts and the exported key file.
- Production CI calls `node scripts/submit-indexnow-urls.mjs` after public verification.

- [ ] **Step 1: Update CI verification and production notification**

Run both focused tests before typecheck. In static artifact verification, compare the exported and tracked key files using `cmp`. After public deployment verification, invoke the IndexNow CLI with no secret environment variables.

- [ ] **Step 2: Align developer and deployment documentation**

Replace Baidu commands and secret instructions with IndexNow behavior, public-key ownership, failure semantics, Webmaster Tools verification, and the new resource-hint test. Record final decisions and verification evidence in the development document and HERMES.

- [ ] **Step 3: Run full verification**

Run:

```bash
pnpm test:indexnow-submit
pnpm test:resource-hints
pnpm test:early-hints
pnpm typecheck
pnpm build
docker compose config
docker build -t blog:local .
git diff --check
```

Also assert the required files exist and inspect the five built `<title>` values and generated Early Hints map for zero `rel=preconnect` values.

- [ ] **Step 4: Review and close findings**

Review the full diff against repository standards and the development document. Resolve all blocking findings, classify non-blocking findings, and create a roadmap only when an evidence-backed accepted follow-up exists.

- [ ] **Step 5: Commit documentation, push, and open the PR**

Commit with `docs: 记录 IndexNow 部署与验证`, push `feat/indexnow-integration`, open a PR summarizing scope, decisions, verification, and operational behavior, then set HERMES to the final PR state.
