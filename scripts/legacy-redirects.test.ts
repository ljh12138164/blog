import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const nginxConfPath = path.join(rootDir, 'deploy/nginx.conf')

function parseLegacyRedirects(nginxConf: string): Map<string, string> {
  const mapMatch = nginxConf.match(/map\s+\$uri\s+\$legacy_post_redirect\s*\{([\s\S]*?)\}/)
  if (!mapMatch) {
    throw new Error('legacy_post_redirect map not found in deploy/nginx.conf')
  }

  const content = mapMatch[1]
  const redirects = new Map<string, string>()

  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#') || line.startsWith('default')) continue

    const lineMatch = line.match(/^"([^"]+)"\s+([^;\s]+);$/)
    if (lineMatch) {
      redirects.set(lineMatch[1], lineMatch[2])
    }
  }

  return redirects
}

describe('legacyRedirects in deploy/nginx.conf', () => {
  it('contains legacy_post_redirect map with valid return 301 directive', () => {
    const nginxConf = readFileSync(nginxConfPath, 'utf8')
    expect(nginxConf).toContain('map $uri $legacy_post_redirect')
    expect(nginxConf).toMatch(/return\s+301\s+\$legacy_post_redirect\$is_args\$args;/)
  })

  it('verifies that every post target route actually exists in app/posts/', () => {
    const nginxConf = readFileSync(nginxConfPath, 'utf8')
    const redirects = parseLegacyRedirects(nginxConf)
    expect(redirects.size).toBeGreaterThan(30)

    for (const [legacyPath, targetPath] of redirects) {
      if (targetPath.startsWith('/posts/')) {
        const slug = targetPath.replace(/^\/posts\//, '')
        const targetMdxPath = path.join(rootDir, 'app', 'posts', slug, 'page.mdx')
        expect(
          existsSync(targetMdxPath),
          `Target article for legacy route "${legacyPath}" does not exist: ${targetMdxPath}`
        ).toBe(true)
      } else {
        expect(targetPath).toBe('/posts')
      }
    }
  })

  it('covers all core historical routes in both no-slash and trailing-slash forms', () => {
    const nginxConf = readFileSync(nginxConfPath, 'utf8')
    const redirects = parseLegacyRedirects(nginxConf)

    const expectedLegacyRoutes: [string, string][] = [
      ['/ai调用/DeepSeek本地部署', '/posts/deepseek-local-deployment'],
      ['/ai调用/谷歌ai读Image图片', '/posts/gemini-image-recognition'],
      ['/ai调用/谷歌ai调用', '/posts/gemini-api'],
      ['/api优化/react-query', '/posts/react-query-api-optimization'],
      ['/cloundflare优化/cdn加速', '/posts/cloudflare-cdn-acceleration'],
      ['/cloudflare优化/cdn加速', '/posts/cloudflare-cdn-acceleration'],
      ['/cloundflare优化/人机验证', '/posts/cloudflare-turnstile'],
      ['/cloudflare优化/人机验证', '/posts/cloudflare-turnstile'],
      ['/cloundflare优化/使用http3和103请求头', '/posts/cloudflare-http3-early-hints'],
      ['/cloudflare优化/使用http3和103请求头', '/posts/cloudflare-http3-early-hints'],
      ['/react/react的执行顺序', '/posts/react-execution-order'],
      ['/优化记录/design优化', '/posts/design-optimization'],
      ['/优化记录/jebet', '/posts/jebet-optimization'],
      ['/优化记录/协同note', '/posts/collaborative-note-optimization'],
      ['/优化记录/自定义表单', '/posts/custom-form-optimization'],
      ['/协同的实现/tiptap协同实现', '/posts/tiptap-collaboration'],
      ['/协同的实现/防冲突算法', '/posts/conflict-resolution-algorithm'],
      ['/博客搭建', '/posts/nextra-blog-setup'],
      ['/后端/怎么将后端部署到cdn', '/posts/edge-function-backend-deployment'],
      ['/后端/构建类型安全的路由', '/posts/type-safe-routing'],
      ['/工程化研究/代码提交校验', '/posts/git-commit-validation'],
      ['/工程化研究/单仓库管理', '/posts/monorepo-management'],
      ['/工程化研究/打包工具tsup', '/posts/tsup-bundler'],
      ['/抽象的问题/用a标签打开dateURL的问题', '/posts/anchor-data-url'],
      ['/抽象的问题/用for of替代forEach', '/posts/for-of-vs-foreach'],
      ['/流程图的自定义连接', '/posts/custom-flowchart-connections'],
      ['/让websocket服务运行在边缘函数中', '/posts/websocket-edge-functions'],
      ['/让websocket服务运行在边缘函数中/indexs', '/posts/websocket-edge-functions'],
      ['/重定向码对seo的影响', '/posts/redirect-status-codes-seo'],
      ['/项目文档/协同文档', '/posts/note-collaboration-system'],
      ['/项目文档/在线画布', '/posts/ljh-design-system'],
      ['/项目文档/自定义表单', '/posts/custom-form-designer'],
      ['/项目文档/项目管理系统', '/posts/jebet-project-management'],
      ['/项目的可行性研究/怎么吧md文件渲染为html网页', '/posts/markdown-to-html'],
      ['/项目的可行性研究/怎么把md文件渲染为html网页', '/posts/markdown-to-html'],
      ['/项目的可行性研究/画布库(canvas)的调研', '/posts/canvas-library-research'],
      ['/项目的可行性研究/自定义表单的可行性', '/posts/custom-form-feasibility']
    ]

    for (const [legacyPath, expectedTarget] of expectedLegacyRoutes) {
      expect(redirects.get(legacyPath)).toBe(expectedTarget)
      expect(redirects.get(`${legacyPath}/`)).toBe(expectedTarget)
    }
  })
})
