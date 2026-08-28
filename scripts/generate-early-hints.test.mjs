import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { generateEarlyHintsMap } from './generate-early-hints.mjs'

async function withStaticExport(files, run) {
  const exportDir = await mkdtemp(path.join(tmpdir(), 'blog-early-hints-'))

  try {
    for (const [relativePath, contents] of Object.entries(files)) {
      const filePath = path.join(exportDir, relativePath)
      await mkdir(path.dirname(filePath), { recursive: true })
      await writeFile(filePath, contents, 'utf8')
    }

    await run(exportDir)
  } finally {
    await rm(exportDir, { recursive: true, force: true })
  }
}

test('maps exported HTML routes to their stylesheet preload hints', async () => {
  await withStaticExport(
    {
      'index.html': '<link rel="stylesheet" href="/_next/static/root.css">',
      'posts/example.html':
        "<link href='/_next/static/post.css' data-precedence='next' rel='stylesheet'>",
      'docs/get $started.html': '<link rel="stylesheet" href="/docs.css">'
    },
    async (exportDir) => {
      assert.equal(
        await generateEarlyHintsMap(exportDir),
        `map $request_uri $early_hints_request_path {
    ~^([^?]*) $1;
}

map $early_hints_request_path $early_hints_link {
    default "";

    "/" "</_next/static/root.css>; rel=preload; as=style";
    "/docs/get \\$started" "</docs.css>; rel=preload; as=style";
    "/posts/example" "</_next/static/post.css>; rel=preload; as=style";
}
`
      )
    }
  )
})

test('preserves explicit preconnects and excludes non-critical hints', async () => {
  await withStaticExport(
    {
      'index.html': `
        <link rel="preconnect" href="https://static.example.com" crossorigin="anonymous">
        <link href="https://static.example.com" rel="preconnect" crossorigin>
        <link rel="preconnect" href="https://private.example.com" crossorigin="use-credentials">
        <link rel="preload" as="script" href="/_next/static/runtime.js">
        <link rel="dns-prefetch" href="https://analytics.example.com">
      `
    },
    async (exportDir) => {
      assert.equal(
        await generateEarlyHintsMap(exportDir),
        `map $request_uri $early_hints_request_path {
    ~^([^?]*) $1;
}

map $early_hints_request_path $early_hints_link {
    default "";

    "/" "<https://static.example.com>; rel=preconnect; crossorigin=anonymous, <https://private.example.com>; rel=preconnect; crossorigin=use-credentials";
}
`
      )
    }
  )
})

test('skips error pages and sorts routes deterministically', async () => {
  await withStaticExport(
    {
      'zeta.html': '<link rel="stylesheet" href="/zeta.css">',
      '404.html': '<link rel="stylesheet" href="/error.css">',
      '_not-found.html': '<link rel="stylesheet" href="/not-found.css">',
      'alpha.html': '<link rel="stylesheet" href="/alpha.css">'
    },
    async (exportDir) => {
      assert.equal(
        await generateEarlyHintsMap(exportDir),
        `map $request_uri $early_hints_request_path {
    ~^([^?]*) $1;
}

map $early_hints_request_path $early_hints_link {
    default "";

    "/alpha" "</alpha.css>; rel=preload; as=style";
    "/zeta" "</zeta.css>; rel=preload; as=style";
}
`
      )
    }
  )
})

test('rejects exported files that normalize to the same route', async () => {
  await withStaticExport(
    {
      'guide.html': '<link rel="stylesheet" href="/guide.css">',
      'guide/index.html': '<link rel="stylesheet" href="/nested-guide.css">'
    },
    async (exportDir) => {
      await assert.rejects(
        generateEarlyHintsMap(exportDir),
        /Multiple HTML files map to the Early Hints route \/guide/
      )
    }
  )
})
