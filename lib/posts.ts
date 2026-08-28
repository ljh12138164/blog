export const recentPosts = [
  {
    slug: 'cloudflare-http3-early-hints',
    title: '从 Link 响应头到 Cloudflare 103：静态博客的 Early Hints 实现',
    description:
      '以 Next.js 静态导出、构建时 Link 映射、Nginx 响应头和 Cloudflare 为主线，完整实现并验证 HTTP 103 Early Hints。',
    date: '2026-08-28',
    category: 'Cloudflare 优化',
    readingTime: '12 分钟'
  },
  {
    slug: 'cloudflare-custom-hostname-fast-ip',
    title: 'Cloudflare 的优选 IP 优化',
    description:
      '用 Cloudflare for SaaS、CloudflareSpeedTest 和宝塔计划任务，为同一域名下的博客入口自动选择 Cloudflare IP，并保留可回滚的源站链路。',
    date: '2026-08-25',
    category: 'Cloudflare 优化',
    readingTime: '15 分钟'
  },
  {
    slug: 'agent-fundamentals',
    title: 'Agent 不是更长的 Prompt：从工具调用到受控执行循环',
    description:
      '从工具定义、消息状态、执行循环、MCP 到人工审批，理解 AI Agent 如何可靠地完成真实任务。',
    date: '2026-08-19',
    category: 'AI 工程',
    readingTime: '12 分钟'
  },
  {
    slug: 'token-and-context',
    title: 'Token 与 Context：模型究竟看见了什么？',
    description:
      '通过分词实验和上下文预算，理解 Token 如何影响输入限制、输出空间、成本与提示缓存。',
    date: '2026-08-19',
    category: 'AI 基础',
    readingTime: '8 分钟'
  }
] as const

export const archiveGroups = [
  {
    title: 'API 与 React',
    posts: [
      { title: 'react-query实现api优化', href: '/posts/react-query-api-optimization' },
      { title: 'React 的执行顺序', href: '/posts/react-execution-order' }
    ]
  },
  {
    title: 'Cloudflare 优化',
    posts: [
      { title: 'Cloudflare 的优选 IP 优化', href: '/posts/cloudflare-custom-hostname-fast-ip' },
      { title: 'cdn加速', href: '/posts/cloudflare-cdn-acceleration' },
      { title: '人机验证', href: '/posts/cloudflare-turnstile' },
      {
        title: '从 Link 响应头到 Cloudflare 103：静态博客的 Early Hints 实现',
        href: '/posts/cloudflare-http3-early-hints'
      }
    ]
  },
  {
    title: '协同的实现',
    posts: [
      { title: 'tiptap的协同集成方案', href: '/posts/tiptap-collaboration' },
      { title: '防冲突算法', href: '/posts/conflict-resolution-algorithm' }
    ]
  },
  {
    title: '后端',
    posts: [
      { title: '后端部署到边缘函数的探索', href: '/posts/edge-function-backend-deployment' },
      { title: '构建类型安全的路由', href: '/posts/type-safe-routing' }
    ]
  },
  {
    title: '工程化研究',
    posts: [
      { title: '代码提交校验', href: '/posts/git-commit-validation' },
      { title: '单仓库管理', href: '/posts/monorepo-management' },
      { title: '打包工具tsup', href: '/posts/tsup-bundler' }
    ]
  },
  {
    title: '抽象的问题',
    posts: [
      { title: '用 a 标签打开 dateURL 的问题', href: '/posts/anchor-data-url' },
      { title: '用for of替代forEach', href: '/posts/for-of-vs-foreach' }
    ]
  },
  {
    title: '项目的可行性研究',
    posts: [
      { title: '怎么把 Markdown 渲染为网页', href: '/posts/markdown-to-html' },
      { title: '画布库(canvas)的调研', href: '/posts/canvas-library-research' },
      { title: '自定义表单的可行性', href: '/posts/custom-form-feasibility' }
    ]
  },
  {
    title: '建站与专题',
    posts: [
      { title: '基于 Next.js 和 Nextra 搭建个人技术博客', href: '/posts/nextra-blog-setup' },
      { title: '流程图的自定义连接', href: '/posts/custom-flowchart-connections' },
      { title: '让websocket服务运行在边缘函数中', href: '/posts/websocket-edge-functions' },
      { title: '重定向码对seo的影响', href: '/posts/redirect-status-codes-seo' }
    ]
  }
] as const

export const archivePostCount = archiveGroups.reduce(
  (count, group) => count + group.posts.length,
  0
)
