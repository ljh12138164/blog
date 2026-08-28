import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import { extractSiteUrls, submitBaiduUrls } from './submit-baidu-urls.mjs'

test('extracts unique URLs belonging to the configured site', () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset>
      <url><loc>https://blog.ljhboard.cn/</loc></url>
      <url><loc>https://blog.ljhboard.cn/posts/early-hints?a=1&amp;b=2</loc></url>
      <url><loc>https://blog.ljhboard.cn/</loc></url>
      <url><loc>https://example.com/not-this-site</loc></url>
      <url><loc>not-a-url</loc></url>
    </urlset>`

  assert.deepEqual(extractSiteUrls(sitemap, 'https://blog.ljhboard.cn'), [
    'https://blog.ljhboard.cn/',
    'https://blog.ljhboard.cn/posts/early-hints?a=1&b=2'
  ])
})

test('posts newline-delimited URLs and returns the Baidu result', async (context) => {
  let request
  const server = createServer(async (incoming, response) => {
    let body = ''
    for await (const chunk of incoming) body += chunk
    request = { url: incoming.url, contentType: incoming.headers['content-type'], body }
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ success: 2, remain: 98 }))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => server.close())

  const address = server.address()
  const result = await submitBaiduUrls({
    urls: ['https://blog.ljhboard.cn/', 'https://blog.ljhboard.cn/posts/early-hints'],
    site: 'https://blog.ljhboard.cn',
    token: 'test-token',
    endpoint: `http://127.0.0.1:${address.port}/urls`
  })

  assert.deepEqual(result, { success: 2, remain: 98 })
  assert.equal(request.contentType, 'text/plain')
  assert.equal(
    request.body,
    'https://blog.ljhboard.cn/\nhttps://blog.ljhboard.cn/posts/early-hints'
  )
  assert.match(request.url, /^\/urls\?site=https%3A%2F%2Fblog\.ljhboard\.cn&token=test-token$/)
})

test('rejects invalid URLs reported by Baidu', async (context) => {
  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json')
    response.end(JSON.stringify({ success: 0, remain: 100, not_valid: ['bad-url'] }))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => server.close())

  const address = server.address()
  await assert.rejects(
    submitBaiduUrls({
      urls: ['https://blog.ljhboard.cn/'],
      site: 'https://blog.ljhboard.cn',
      token: 'test-token',
      endpoint: `http://127.0.0.1:${address.port}/urls`
    }),
    /rejected 1 URL/
  )
})
