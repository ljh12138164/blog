import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import test from 'node:test'
import { extractSiteUrls, submitIndexNowUrls } from './submit-indexnow-urls.mjs'

test('extracts unique sitemap URLs under the configured site path', () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset>
      <url><loc>https://blog.ljhboard.cn/</loc></url>
      <url><loc>https://blog.ljhboard.cn/posts/example?a=1&amp;b=2#section</loc></url>
      <url><loc>https://blog.ljhboard.cn/</loc></url>
      <url><loc>https://blog.ljhboard.cn.evil.example/posts/example</loc></url>
      <url><loc>not-a-url</loc></url>
    </urlset>`

  assert.deepEqual(extractSiteUrls(sitemap, 'https://blog.ljhboard.cn'), [
    'https://blog.ljhboard.cn/',
    'https://blog.ljhboard.cn/posts/example?a=1&b=2'
  ])
})

test('posts the IndexNow JSON contract and accepts a successful response', async (context) => {
  let request
  const server = createServer(async (incoming, response) => {
    let body = ''
    for await (const chunk of incoming) body += chunk
    request = {
      method: incoming.method,
      url: incoming.url,
      contentType: incoming.headers['content-type'],
      body: JSON.parse(body)
    }
    response.writeHead(202).end()
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => server.close())

  const address = server.address()
  const urls = ['https://blog.ljhboard.cn/', 'https://blog.ljhboard.cn/posts/example']
  const accepted = await submitIndexNowUrls({
    urls,
    site: 'https://blog.ljhboard.cn',
    key: 'test-key',
    endpoint: `http://127.0.0.1:${address.port}/indexnow`
  })

  assert.equal(accepted, 2)
  assert.deepEqual(request, {
    method: 'POST',
    url: '/indexnow',
    contentType: 'application/json; charset=utf-8',
    body: {
      host: 'blog.ljhboard.cn',
      key: 'test-key',
      keyLocation: 'https://blog.ljhboard.cn/test-key.txt',
      urlList: urls
    }
  })
})

test('rejects empty and oversized URL batches before submission', async () => {
  const input = {
    site: 'https://blog.ljhboard.cn',
    key: 'test-key',
    endpoint: 'http://127.0.0.1:1/indexnow'
  }

  await assert.rejects(submitIndexNowUrls({ ...input, urls: [] }), /no eligible URLs/i)
  await assert.rejects(
    submitIndexNowUrls({
      ...input,
      urls: Array.from({ length: 10_001 }, (_, index) => `https://blog.ljhboard.cn/posts/${index}`)
    }),
    /maximum of 10000 URLs/i
  )
})

test('reports the HTTP status without exposing the response body', async (context) => {
  const server = createServer((_request, response) => {
    response.writeHead(403).end('sensitive upstream details')
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  context.after(() => server.close())

  const address = server.address()
  await assert.rejects(
    submitIndexNowUrls({
      urls: ['https://blog.ljhboard.cn/'],
      site: 'https://blog.ljhboard.cn',
      key: 'test-key',
      endpoint: `http://127.0.0.1:${address.port}/indexnow`
    }),
    (error) => {
      assert.match(error.message, /HTTP 403/)
      assert.doesNotMatch(error.message, /sensitive upstream details/)
      return true
    }
  )
})
