import { createServer } from 'node:http'
import { describe, expect, it } from 'vitest'
import { extractSiteUrls, submitIndexNowUrls } from './submit-indexnow-urls.mjs'

async function closeServer(server) {
  return new Promise((resolve) => server.close(resolve))
}

describe('submitIndexNowUrls', () => {
  it('extracts unique sitemap URLs under the configured site path', () => {
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset>
      <url><loc>https://blog.ljhboard.cn/</loc></url>
      <url><loc>https://blog.ljhboard.cn/posts/example?a=1&amp;b=2#section</loc></url>
      <url><loc>https://blog.ljhboard.cn/</loc></url>
      <url><loc>https://blog.ljhboard.cn.evil.example/posts/example</loc></url>
      <url><loc>not-a-url</loc></url>
    </urlset>`

    expect(extractSiteUrls(sitemap, 'https://blog.ljhboard.cn')).toEqual([
      'https://blog.ljhboard.cn/',
      'https://blog.ljhboard.cn/posts/example?a=1&b=2'
    ])
  })

  it('posts the IndexNow JSON contract and accepts a successful response', async () => {
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

    try {
      const address = server.address()
      const urls = ['https://blog.ljhboard.cn/', 'https://blog.ljhboard.cn/posts/example']
      const accepted = await submitIndexNowUrls({
        urls,
        site: 'https://blog.ljhboard.cn',
        key: 'test-key',
        endpoint: `http://127.0.0.1:${address.port}/indexnow`
      })

      expect(accepted).toBe(2)
      expect(request).toEqual({
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
    } finally {
      await closeServer(server)
    }
  })

  it('rejects empty and oversized URL batches before submission', async () => {
    const input = {
      site: 'https://blog.ljhboard.cn',
      key: 'test-key',
      endpoint: 'http://127.0.0.1:1/indexnow'
    }

    await expect(submitIndexNowUrls({ ...input, urls: [] })).rejects.toThrow(/no eligible URLs/i)
    await expect(
      submitIndexNowUrls({
        ...input,
        urls: Array.from(
          { length: 10_001 },
          (_, index) => `https://blog.ljhboard.cn/posts/${index}`
        )
      })
    ).rejects.toThrow(/maximum of 10000 URLs/i)
  })

  it('reports the HTTP status without exposing the response body', async () => {
    const server = createServer((_request, response) => {
      response.writeHead(403).end('sensitive upstream details')
    })
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))

    try {
      const address = server.address()
      let thrownError
      try {
        await submitIndexNowUrls({
          urls: ['https://blog.ljhboard.cn/'],
          site: 'https://blog.ljhboard.cn',
          key: 'test-key',
          endpoint: `http://127.0.0.1:${address.port}/indexnow`
        })
      } catch (error) {
        thrownError = error
      }

      expect(thrownError).toBeDefined()
      expect(thrownError.message).toMatch(/HTTP 403/)
      expect(thrownError.message).not.toMatch(/sensitive upstream details/)
    } finally {
      await closeServer(server)
    }
  })
})
