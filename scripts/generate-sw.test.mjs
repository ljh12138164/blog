import { readFile, rm } from 'node:fs/promises'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { defaultWorkboxConfig, generateServiceWorker } from './generate-sw.mjs'

describe('generateServiceWorker', () => {
  it('has correctly defined runtimeCaching rules matching caching policy', () => {
    const { runtimeCaching, clientsClaim, skipWaiting, inlineWorkboxRuntime } = defaultWorkboxConfig

    expect(clientsClaim).toBe(true)
    expect(skipWaiting).toBe(true)
    expect(inlineWorkboxRuntime).toBe(true)

    // 1. 第三方与动态内容: NetworkOnly
    const networkOnlyRoute = runtimeCaching.find((r) => r.handler === 'NetworkOnly')
    expect(networkOnlyRoute).toBeDefined()

    // 2. 页面路由 HTML: NetworkFirst
    const htmlRoute = runtimeCaching.find((r) => r.handler === 'NetworkFirst')
    expect(htmlRoute).toBeDefined()
    expect(htmlRoute.options.cacheName).toBe('pages-cache')
    expect(htmlRoute.options.networkTimeoutSeconds).toBe(3)

    // 3. 构建哈希资源: CacheFirst
    const staticHashedRoute = runtimeCaching.find((r) => r.handler === 'CacheFirst')
    expect(staticHashedRoute).toBeDefined()
    expect(staticHashedRoute.options.cacheName).toBe('next-static-cache')

    // 4. 静态公共资源: StaleWhileRevalidate
    const staticMediaRoute = runtimeCaching.find((r) => r.handler === 'StaleWhileRevalidate')
    expect(staticMediaRoute).toBeDefined()
    expect(staticMediaRoute.options.cacheName).toBe('static-assets-cache')
  })

  it('generates a self-contained sw.js without external Google CDN dependencies', async () => {
    const testSwDest = path.resolve('.test-sw-output.js')

    try {
      const result = await generateServiceWorker({
        swDest: testSwDest
      })

      expect(result.filePaths.length).toBeGreaterThan(0)

      const swContent = await readFile(testSwDest, 'utf-8')
      expect(swContent.length).toBeGreaterThan(1000)

      // 验证没有引用外部 Google CDN
      expect(swContent).not.toContain('storage.googleapis.com')

      // 验证包含核心缓存名称与策略逻辑
      expect(swContent).toContain('pages-cache')
      expect(swContent).toContain('next-static-cache')
      expect(swContent).toContain('static-assets-cache')
      expect(swContent).toContain('giscus.app')
      expect(swContent).toContain('skipWaiting')
      expect(swContent).toContain('clients.claim')
    } finally {
      await rm(testSwDest, { force: true })
    }
  })
})
