# Personal Tech Notebook UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the generic editorial UI with a compact AstroPaper-inspired personal technical notebook and add persistent, flash-resistant light and dark themes.

**Architecture:** Global semantic CSS tokens own the two visual themes. A small pure theme module owns resolution and persistence, while one client button exposes the interaction; server-rendered pages continue to own all content and layout. Existing shared shell, search, article, code and error components are restyled instead of replaced.

**Tech Stack:** Next.js 16.0.7, React 19.1.0, Nextra 4.6.1, Tailwind CSS 4.3.3, Node test runner, Biome 2.5.10

**Spec:** `docs/superpowers/specs/2026-09-01-personal-tech-notebook-ui-design.md`

## Global Constraints

- Do not add production dependencies, remote fonts, gradients, textures, cards, glow, or decorative animation.
- Keep Pagefind, metadata, JSON-LD, sitemap, canonical URLs and static export behavior unchanged.
- Use one teal accent per view and semantic theme tokens instead of component-level theme hex colors.
- Keep the content axis at approximately 720px and article prose at approximately 680px.
- Cover desktop, tablet and 390px mobile in both light and dark themes.
- Preserve native controls, visible keyboard focus, 44px interactive targets and reduced-motion behavior.

---

### Task 1: Theme foundation and persistent toggle

**Files:**
- Create: `lib/theme.ts`
- Create: `lib/theme.test.ts`
- Create: `app/_components/theme-toggle.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `package.json`

**Interfaces:**
- Produces: `Theme = 'light' | 'dark'`, `resolveTheme(savedTheme, prefersDark): Theme`, `themeInitScript: string`, and `<ThemeToggle />`.
- Consumers: `RootLayout` embeds `themeInitScript`; `SiteShell` renders `<ThemeToggle />`.

- [ ] **Step 1: Add failing theme-resolution tests**

```ts
import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveTheme } from './theme.ts'

test('uses a valid saved theme before the system preference', () => {
  assert.equal(resolveTheme('light', true), 'light')
  assert.equal(resolveTheme('dark', false), 'dark')
})

test('falls back to the system preference for missing or invalid values', () => {
  assert.equal(resolveTheme(null, true), 'dark')
  assert.equal(resolveTheme('sepia', false), 'light')
})
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `node --experimental-strip-types --test lib/theme.test.ts`

Expected: FAIL because `lib/theme.ts` does not exist.

- [ ] **Step 3: Implement the pure resolver and initialization script**

```ts
export type Theme = 'light' | 'dark'
export const themeStorageKey = 'blog-theme'

export function resolveTheme(savedTheme: string | null, prefersDark: boolean): Theme {
  if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
  return prefersDark ? 'dark' : 'light'
}

export const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem('${themeStorageKey}');
    const theme = saved === 'light' || saved === 'dark'
      ? saved
      : (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
})();`
```

- [ ] **Step 4: Run the test and confirm GREEN**

Run: `node --experimental-strip-types --test lib/theme.test.ts`

Expected: 2 passing tests.

- [ ] **Step 5: Add the client toggle and pre-paint initialization**

`ThemeToggle` reads `document.documentElement.dataset.theme` after mount, toggles it, persists `blog-theme`, and exposes `aria-label="切换到深色主题"` or `aria-label="切换到浅色主题"`. `RootLayout` embeds `themeInitScript` in `<head>`, adds `suppressHydrationWarning` to `<html>`, and changes viewport color scheme to `light dark`.

- [ ] **Step 6: Replace global visual primitives with semantic light/dark tokens**

Define `paper`, `ink`, `muted`, `line`, `accent`, `accent-soft`, `code`, and `code-header` in light mode and override them under `html[data-theme='dark']`. Keep focus visible, add theme-aware Shiki token selection, and remove the current serif-first brand styling.

- [ ] **Step 7: Add and run the focused test script**

Add `"test:theme": "node --experimental-strip-types --test lib/theme.test.ts"` to `package.json`.

Run: `pnpm test:theme && pnpm typecheck`

Expected: theme tests pass and TypeScript exits successfully.

- [ ] **Step 8: Commit the theme foundation**

```bash
git add lib/theme.ts lib/theme.test.ts app/_components/theme-toggle.tsx app/layout.tsx app/globals.css package.json
git commit -m "feat: add persistent light and dark themes"
```

### Task 2: Shared shell, search and error surfaces

**Files:**
- Modify: `app/_components/site-shell.tsx`
- Modify: `app/_components/search.tsx`
- Modify: `app/_components/error-state.tsx`

**Interfaces:**
- Consumes: `<ThemeToggle />` and the semantic tokens from Task 1.
- Produces: one shared 720px navigation/content axis and theme-aware shared states.

- [ ] **Step 1: Write a failing static contract test**

Extend `lib/theme.test.ts` to read `site-shell.tsx` and assert that it includes `ThemeToggle`, a `max-w-[720px]` shell class, and an accessible navigation label. Assert search retains `<dialog>`, `aria-live="polite"`, and a labelled search input.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `pnpm test:theme`

Expected: FAIL because the current shell has no `ThemeToggle` and uses a 1120px axis.

- [ ] **Step 3: Restyle the shared surfaces**

Remove the avatar-led editorial brand treatment. Render a compact `ljh.notes` wordmark, text navigation, search and theme controls on the shared axis. Restyle the dialog with the semantic tokens and reduce radius/shadow. Restyle errors as compact field notes instead of split broadsheet panels, retaining retry, article and home actions.

- [ ] **Step 4: Run focused verification and confirm GREEN**

Run: `pnpm test:theme && pnpm exec biome check app/_components/site-shell.tsx app/_components/search.tsx app/_components/error-state.tsx`

Expected: all commands exit successfully.

- [ ] **Step 5: Commit shared surfaces**

```bash
git add lib/theme.test.ts app/_components/site-shell.tsx app/_components/search.tsx app/_components/error-state.tsx
git commit -m "feat: reshape shared blog surfaces"
```

### Task 3: Homepage and article index

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/posts/page.tsx`

**Interfaces:**
- Consumes: `recentPosts`, `archiveGroups`, `archivePostCount`, `getAllPosts`, `groupPostsByYear`, and shared semantic tokens.
- Produces: compact notebook-style discovery and archive views; no new data interfaces.

- [ ] **Step 1: Add failing page-structure contracts**

Extend `lib/theme.test.ts` to assert that the homepage contains the copy `现场注记`, uses the shared `max-w-[720px]` axis, and no longer declares `font-serif`. Assert the post index no longer contains the decorative timeline dot class and still links every rendered post through `/posts/${post.slug}`.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `pnpm test:theme`

Expected: FAIL against the current two-column hero, serif headings, and timeline marker.

- [ ] **Step 3: Implement the compact homepage**

Use the confirmed content order: author thesis, featured latest note, three starter notes, compact topic archive and about link. Replace `THINK · BUILD · REFLECT`, numbered cards and broadsheet columns with real field-note copy, dates, categories and one teal accent.

- [ ] **Step 4: Implement the compact post index**

Keep year grouping and empty state. Replace the timeline with flat year sections and date/title/summary rows; keep year jump navigation and 44px link targets.

- [ ] **Step 5: Run focused verification and confirm GREEN**

Run: `pnpm test:theme && pnpm exec biome check app/page.tsx app/posts/page.tsx`

Expected: all commands exit successfully.

- [ ] **Step 6: Commit discovery pages**

```bash
git add lib/theme.test.ts app/page.tsx app/posts/page.tsx
git commit -m "feat: redesign blog discovery pages"
```

### Task 4: Article reading system and final verification

**Files:**
- Modify: `app/_components/article.tsx`
- Modify: `app/_components/code-block.tsx`
- Modify: `app/globals.css`
- Modify: `docs/development/personal-tech-notebook-ui.md`
- Modify: `HERMES.md`

**Interfaces:**
- Consumes: Nextra headings, existing article metadata, semantic tokens and the shared 720px axis.
- Produces: a 680px prose column, desktop TOC, theme-aware code/quote/table/link styling and final verification evidence.

- [ ] **Step 1: Add failing article contracts**

Extend `lib/theme.test.ts` to assert that `article.tsx` uses `max-w-[680px]`, contains no `font-serif`, retains `data-pagefind-body`, and renders the desktop table of contents. Assert `globals.css` has a dark-theme selector and both `--shiki-light` and `--shiki-dark` token references.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `pnpm test:theme`

Expected: FAIL against the current 760px serif article and light-only Shiki rule.

- [ ] **Step 3: Implement the reading system**

Move the article to the shared axis with a 680px prose column, compact metadata, sans-serif headings and a restrained desktop TOC. Make inline code, code blocks, quotes, tables, images and external links use semantic theme styling. Constrain wide tables and code to their own horizontal scrollers so 390px pages do not overflow.

- [ ] **Step 4: Run focused verification and confirm GREEN**

Run: `pnpm test:theme && pnpm exec biome check app/_components/article.tsx app/_components/code-block.tsx app/globals.css`

Expected: all commands exit successfully.

- [ ] **Step 5: Run repository verification**

Run: `pnpm check && pnpm typecheck && pnpm build`

Expected: lint and typecheck exit successfully; Next builds all static pages; Pagefind, sitemap and SEO verification complete.

- [ ] **Step 6: Verify required static outputs**

Run in PowerShell:

```powershell
@('out/index.html','out/_pagefind/pagefind.js','out/sitemap.xml','out/robots.txt') |
  ForEach-Object { if (-not (Test-Path $_)) { throw "Missing static output: $_" } }
```

Expected: command exits without an exception.

- [ ] **Step 7: Perform visual and interaction QA**

Inspect `/`, `/posts`, one representative long article, search, `/not-found-check`, and the runtime error surface where feasible at desktop and 390px in light and dark modes. Verify theme persistence, system fallback, no visible theme flash, focus, search states, code contrast, table/code local scrolling and `scrollWidth === clientWidth` at 390px.

- [ ] **Step 8: Record evidence and commit**

Update the development document with exact command results, tested routes, viewports, theme states and any remaining unverified surface. Update `HERMES.md` with the next review action.

```bash
git add lib/theme.test.ts app/_components/article.tsx app/_components/code-block.tsx app/globals.css docs/development/personal-tech-notebook-ui.md HERMES.md
git commit -m "feat: complete notebook reading experience"
```

- [ ] **Step 9: Review before PR**

Review the full diff against repository standards and the accepted design. Resolve every blocking finding, rerun affected checks, update verification evidence, then create the roadmap only for evidence-backed non-blocking follow-ups.
