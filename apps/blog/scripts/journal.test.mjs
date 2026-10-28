import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'

it('keeps the writing entry out of public links and sitemap and marks it noindex', () => {
  for (const file of ['index.html', 'notes.html', 'about.html']) {
    expect(readFileSync(`out/${file}`, 'utf8')).not.toMatch(/href="\/write(?:["/?#])/)
  }
  expect(readFileSync('out/sitemap.xml', 'utf8')).not.toContain('/write')
  expect(readFileSync('out/write.html', 'utf8')).toMatch(
    /name="robots" content="noindex, nofollow"/
  )
  expect(readFileSync('out/write.html', 'utf8')).toContain('data-pagefind-ignore')
})
