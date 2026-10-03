import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generateSW } from 'workbox-build'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

export const defaultWorkboxConfig = {
  globDirectory: 'out',
  globPatterns: [],
  swDest: 'out/sw.js',
  clientsClaim: true,
  skipWaiting: true,
  inlineWorkboxRuntime: true,
  cleanupOutdatedCaches: true,
  sourcemap: false,
  runtimeCaching: [
    {
      // 1. 第三方与动态内容（如 Giscus 评论、外部统计等）：NetworkOnly（走网络）
      // 避免将外部动态请求和跨域 iframe 写入缓存引起异常
      urlPattern: ({ url, sameOrigin }) => {
        if (!sameOrigin) return true
        return (
          url.hostname.includes('giscus.app') ||
          url.hostname.includes('baidu.com') ||
          url.hostname.includes('google') ||
          url.hostname.includes('cloudflare') ||
          url.pathname.startsWith('/api/') ||
          url.pathname.startsWith('/stats/')
        )
      },
      handler: 'NetworkOnly'
    },
    {
      // 2. 页面文档（HTML 路由）：NetworkFirst（网络优先）
      // 优先请求网络获取最新文章，网络离线/超时时回退到本地缓存
      urlPattern: ({ request, url, sameOrigin }) =>
        sameOrigin && (request.mode === 'navigate' || url.pathname.endsWith('.html')),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 3,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 天
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // 3. 构建哈希资源（/_next/static/*）：CacheFirst（缓存优先）
      // Next.js 产物自带 content-hash，内容变更文件名必变，可以安全长期缓存
      urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/_next/static/'),
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-cache',
        expiration: {
          maxEntries: 500,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 年
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // 4. 静态公共资源与搜索索引（图片、字体、Pagefind 等）：StaleWhileRevalidate
      urlPattern: ({ url, sameOrigin }) =>
        sameOrigin &&
        (url.pathname.startsWith('/_pagefind/') ||
          /\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|txt|xml)$/i.test(url.pathname)),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-assets-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 天
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    }
  ]
}

export async function generateServiceWorker(customConfig = {}) {
  const outDir = path.join(rootDir, 'out')
  const publicDir = path.join(rootDir, 'public')

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  const config = {
    ...defaultWorkboxConfig,
    ...customConfig,
    globDirectory: customConfig.globDirectory || (fs.existsSync(outDir) ? outDir : publicDir),
    swDest: customConfig.swDest || path.join(outDir, 'sw.js')
  }

  const result = await generateSW(config)

  // 同步复制一份至 public/sw.js 保持一致
  if (fs.existsSync(config.swDest)) {
    const publicSw = path.join(publicDir, 'sw.js')
    fs.copyFileSync(config.swDest, publicSw)
  }

  return result
}

async function main() {
  try {
    const { count, filePaths } = await generateServiceWorker()
    console.log(
      `⚙️ Service Worker 生成成功！写入目标: ${filePaths.join(', ')} (预缓存 ${count} 个条目, 包含 Workbox 内联运行时)`
    )
  } catch (err) {
    console.error('❌ Service Worker 生成失败:', err)
    process.exit(1)
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(__filename)) {
  main()
}
