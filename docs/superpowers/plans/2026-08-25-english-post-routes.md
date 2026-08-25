# English Post Routes Migration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every remaining article route to `/posts/<english-slug>` and keep navigation and SEO URLs consistent.

**Architecture:** Treat each article directory as an indivisible content unit so its MDX file and relative image assets move together. Use one explicit mapping as the source of truth, validate it before mutation, then mechanically update the article canonical/Open Graph URL and `lib/posts.ts` hrefs.

**Tech Stack:** Next.js App Router, Nextra MDX, TypeScript, Node.js migration script.

**Spec:** `HERMES.md`

## Global Constraints

- Preserve article bodies and binary assets byte-for-byte.
- Keep `/about` and the four existing `/posts/*` articles unchanged except for the completed DeepSeek migration.
- Every migrated canonical, Open Graph URL, and archive href must use `/posts/<english-slug>`.
- Do not deploy or commit as part of this plan.

## Route mapping

| Old route | New route |
| --- | --- |
| `/ai调用/谷歌ai读Image图片` | `/posts/gemini-image-recognition` |
| `/ai调用/谷歌ai调用` | `/posts/gemini-api` |
| `/api优化/react-query` | `/posts/react-query-api-optimization` |
| `/cloundflare优化/cdn加速` | `/posts/cloudflare-cdn-acceleration` |
| `/cloundflare优化/人机验证` | `/posts/cloudflare-turnstile` |
| `/cloundflare优化/使用http3和103请求头` | `/posts/cloudflare-http3-early-hints` |
| `/react/react的执行顺序` | `/posts/react-execution-order` |
| `/优化记录/design优化` | `/posts/design-optimization` |
| `/优化记录/jebet` | `/posts/jebet-optimization` |
| `/优化记录/协同note` | `/posts/collaborative-note-optimization` |
| `/优化记录/自定义表单` | `/posts/custom-form-optimization` |
| `/协同的实现/tiptap协同实现` | `/posts/tiptap-collaboration` |
| `/协同的实现/防冲突算法` | `/posts/conflict-resolution-algorithm` |
| `/博客搭建` | `/posts/nextra-blog-setup` |
| `/后端/怎么将后端部署到cdn` | `/posts/edge-function-backend-deployment` |
| `/后端/构建类型安全的路由` | `/posts/type-safe-routing` |
| `/工程化研究/代码提交校验` | `/posts/git-commit-validation` |
| `/工程化研究/单仓库管理` | `/posts/monorepo-management` |
| `/工程化研究/打包工具tsup` | `/posts/tsup-bundler` |
| `/抽象的问题/用a标签打开dateURL的问题` | `/posts/anchor-data-url` |
| `/抽象的问题/用for of替代forEach` | `/posts/for-of-vs-foreach` |
| `/流程图的自定义连接` | `/posts/custom-flowchart-connections` |
| `/让websocket服务运行在边缘函数中/indexs` | `/posts/websocket-edge-functions` |
| `/重定向码对seo的影响` | `/posts/redirect-status-codes-seo` |
| `/项目文档/协同文档` | `/posts/note-collaboration-system` |
| `/项目文档/在线画布` | `/posts/ljh-design-system` |
| `/项目文档/自定义表单` | `/posts/custom-form-designer` |
| `/项目文档/项目管理系统` | `/posts/jebet-project-management` |
| `/项目的可行性研究/怎么吧md文件渲染为html网页` | `/posts/markdown-to-html` |
| `/项目的可行性研究/画布库(canvas)的调研` | `/posts/canvas-library-research` |
| `/项目的可行性研究/自定义表单的可行性` | `/posts/custom-form-feasibility` |

### Task 1: Validate the mapping

**Files:**
- Create temporarily: `scripts/migrate-post-routes.mjs`
- Test: repository filesystem and `lib/posts.ts`

**Interfaces:**
- Consumes: the 31 route pairs above.
- Produces: a validated one-to-one mapping with existing sources and absent destinations.

- [ ] **Step 1: Write a migration script whose validation exits non-zero until all target routes exist.**
- [ ] **Step 2: Run `rtk node scripts/migrate-post-routes.mjs --check-targets` and verify it fails because the new routes are absent.**
- [ ] **Step 3: Run `rtk node scripts/migrate-post-routes.mjs --validate` and verify all 31 sources exist, destinations are unique, and destinations do not exist.**

### Task 2: Move content and rewrite route references

**Files:**
- Move: the 31 mapped article directories to `app/posts/<english-slug>/`
- Modify: each moved `page.mdx`
- Modify: `lib/posts.ts`
- Delete after use: `scripts/migrate-post-routes.mjs`

**Interfaces:**
- Consumes: the validated mapping from Task 1.
- Produces: 31 English App Router pages with matching SEO and navigation URLs.

- [ ] **Step 1: Run `rtk node scripts/migrate-post-routes.mjs --apply` to move directories and replace exact old route strings.**
- [ ] **Step 2: Run `rtk node scripts/migrate-post-routes.mjs --check-targets` and verify all targets and references pass.**
- [ ] **Step 3: Scan `app` and `lib/posts.ts` for old mapped route strings; expected result is zero matches.**
- [ ] **Step 4: Remove the temporary migration script with `apply_patch`.**

### Task 3: Verify the static site

**Files:**
- Verify generated files under `out/` without tracking them.

**Interfaces:**
- Consumes: migrated routes from Task 2.
- Produces: build evidence for all 35 `/posts/*` articles and required search/SEO artifacts.

- [ ] **Step 1: Run `rtk pnpm typecheck`; expected exit code 0.**
- [ ] **Step 2: Run `rtk pnpm build`; expected exit code 0 and all 31 new routes in the route table.**
- [ ] **Step 3: Assert `out/index.html`, `out/_pagefind/pagefind.js`, `out/sitemap.xml`, and `out/robots.txt` exist.**
- [ ] **Step 4: Assert every mapped route has an exported HTML file and sitemap entry.**
- [ ] **Step 5: Restore `HERMES.md` to idle and review `git diff --stat` plus `git status --short`.**

## Rollback

Before commit, reverse the exact mapping and replace `/posts/<slug>` with the corresponding old route. After commit, revert the migration commit. No article body or asset is transformed, so rollback is a directory move plus exact string reversal.
