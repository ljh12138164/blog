import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gunzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { precompressDirectory } from './precompress.mjs'

describe('precompress', () => {
  it('generates valid gzip companion files for compressible text assets', async () => {
    const testDir = path.resolve('.test-precompress-tmp')
    await rm(testDir, { recursive: true, force: true })
    await mkdir(testDir, { recursive: true })

    try {
      const sampleHtml = `<html><body>${'<h1>Hello World</h1><p>Test content for precompression.</p>'.repeat(50)}</body></html>`
      const sampleCss = `body { margin: 0; background: #fff; } ${'.class { color: red; } '.repeat(50)}`
      const tinyFile = 'tiny'

      await writeFile(path.join(testDir, 'index.html'), sampleHtml, 'utf8')
      await writeFile(path.join(testDir, 'style.css'), sampleCss, 'utf8')
      await writeFile(path.join(testDir, 'tiny.txt'), tinyFile, 'utf8')

      const result = await precompressDirectory(testDir)

      expect(result.count).toBe(2)
      expect(result.savedBytes).toBeGreaterThan(0)

      const gzHtml = await readFile(path.join(testDir, 'index.html.gz'))
      const decompressed = gunzipSync(gzHtml).toString('utf8')
      expect(decompressed).toBe(sampleHtml)
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })
})
