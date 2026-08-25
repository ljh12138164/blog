export const recentPosts = [
  {
    slug: 'pagefind-chinese-search-and-stemming',
    title: '为什么 Pagefind 提示不支持中文 Stemming？深入解析搜索引擎中的分词与词干提取',
    description: '深度剖析静态搜索引擎 Pagefind 的多语言检索架构：从自然语言处理视角解析为什么中文需要分词（Jieba）而非词干提取（Stemming），并详解 Pagefind v1.5.0 的 Rust Jieba 机制与 CLI 日志真相。',
    date: '2026-08-25',
    category: '建站与专题',
    readingTime: '8 分钟'
  },
  {
    slug: 'agent-fundamentals',
    title: 'Agent 不是更长的 Prompt：从工具调用到受控执行循环',
    description: '从工具定义、消息状态、执行循环、MCP 到人工审批，理解 AI Agent 如何可靠地完成真实任务。',
    date: '2026-08-19',
    category: 'AI 工程',
    readingTime: '12 分钟'
  },
  {
    slug: 'token-and-context',
    title: 'Token 与 Context：模型究竟看见了什么？',
    description: '通过分词实验和上下文预算，理解 Token 如何影响输入限制、输出空间、成本与提示缓存。',
    date: '2026-08-19',
    category: 'AI 基础',
    readingTime: '8 分钟'
  },
  {
    slug: 'prompting-principles',
    title: '如何为 AI 应用设计高质量提示词',
    description: '用成功标准、指令边界、示例和评测，把提示词从“会写”变成可验证的工程组件。',
    date: '2026-08-08',
    category: '实践方法',
    readingTime: '8 分钟'
  }
] as const

export const archiveGroups = [
  {
    title: 'AI 调用',
    posts: [
      { title: 'DeepSeek本地部署', href: '/posts/deepseek-local-deployment' },
      { title: '谷歌AI的图片识别API实现', href: '/posts/gemini-image-recognition' },
      { title: '谷歌ai调用', href: '/posts/gemini-api' }
    ]
  },
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
      { title: 'cdn加速', href: '/posts/cloudflare-cdn-acceleration' },
      { title: '人机验证', href: '/posts/cloudflare-turnstile' },
      { title: 'http3和103请求头', href: '/posts/cloudflare-http3-early-hints' }
    ]
  },
  {
    title: '优化记录',
    posts: [
      { title: 'design优化', href: '/posts/design-optimization' },
      { title: 'jebet', href: '/posts/jebet-optimization' },
      { title: '协同note', href: '/posts/collaborative-note-optimization' },
      { title: '自定义表单', href: '/posts/custom-form-optimization' }
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
    title: '项目文档',
    posts: [
      { title: 'Note协同文档系统', href: '/posts/note-collaboration-system' },
      { title: 'LJH-Design设计系统', href: '/posts/ljh-design-system' },
      { title: '自定义表单设计器', href: '/posts/custom-form-designer' },
      { title: 'Jebet项目管理系统', href: '/posts/jebet-project-management' }
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
      { title: 'Pagefind中文分词与Stemming机制', href: '/posts/pagefind-chinese-search-and-stemming' },
      { title: '基于 Next.js 和 Nextra 搭建个人技术博客', href: '/posts/nextra-blog-setup' },
      { title: '流程图的自定义连接', href: '/posts/custom-flowchart-connections' },
      { title: '让websocket服务运行在边缘函数中', href: '/posts/websocket-edge-functions' },
      { title: '重定向码对seo的影响', href: '/posts/redirect-status-codes-seo' }
    ]
  }
] as const

export const archivePostCount = archiveGroups.reduce((count, group) => count + group.posts.length, 0)
