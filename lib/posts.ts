export const recentPosts = [
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
    description: '从分词、用量统计、数据表示、上下文窗口到提示词缓存，理解 Token 如何影响 AI 应用的成本与设计。',
    date: '2026-08-19',
    category: 'AI 基础',
    readingTime: '10 分钟'
  },
  {
    slug: 'rag-in-practice',
    title: 'RAG 不是魔法：检索增强生成的工作方式',
    description: '拆解文档切分、向量检索、重排与生成，建立完整的 RAG 心智模型。',
    date: '2026-08-12',
    category: 'AI 工程',
    readingTime: '7 分钟'
  },
  {
    slug: 'prompting-principles',
    title: '如何为 AI 应用设计高质量提示词',
    description: '从推理、检索与示例出发，把提示词写成清晰、可验证的任务说明。',
    date: '2026-08-08',
    category: '实践方法',
    readingTime: '12 分钟'
  }
] as const

export const archiveGroups = [
  {
    title: 'AI 调用',
    posts: [
      { title: 'DeepSeek本地部署', href: '/ai调用/DeepSeek本地部署' },
      { title: '谷歌AI的图片识别API实现', href: '/ai调用/谷歌ai读Image图片' },
      { title: '谷歌ai调用', href: '/ai调用/谷歌ai调用' }
    ]
  },
  {
    title: 'API 与 React',
    posts: [
      { title: 'react-query实现api优化', href: '/api优化/react-query' },
      { title: 'React 的执行顺序', href: '/react/react的执行顺序' }
    ]
  },
  {
    title: 'Cloudflare 优化',
    posts: [
      { title: 'cdn加速', href: '/cloundflare优化/cdn加速' },
      { title: '人机验证', href: '/cloundflare优化/人机验证' },
      { title: 'http3和103请求头', href: '/cloundflare优化/使用http3和103请求头' }
    ]
  },
  {
    title: '优化记录',
    posts: [
      { title: 'design优化', href: '/优化记录/design优化' },
      { title: 'jebet', href: '/优化记录/jebet' },
      { title: '协同note', href: '/优化记录/协同note' },
      { title: '自定义表单', href: '/优化记录/自定义表单' }
    ]
  },
  {
    title: '协同的实现',
    posts: [
      { title: 'tiptap的协同集成方案', href: '/协同的实现/tiptap协同实现' },
      { title: '防冲突算法', href: '/协同的实现/防冲突算法' }
    ]
  },
  {
    title: '后端',
    posts: [
      { title: '后端部署到边缘函数的探索', href: '/后端/怎么将后端部署到cdn' },
      { title: '构建类型安全的路由', href: '/后端/构建类型安全的路由' }
    ]
  },
  {
    title: '工程化研究',
    posts: [
      { title: '代码提交校验', href: '/工程化研究/代码提交校验' },
      { title: '单仓库管理', href: '/工程化研究/单仓库管理' },
      { title: '打包工具tsup', href: '/工程化研究/打包工具tsup' }
    ]
  },
  {
    title: '抽象的问题',
    posts: [
      { title: '用 a 标签打开 dateURL 的问题', href: '/抽象的问题/用a标签打开dateURL的问题' },
      { title: '用for of替代forEach', href: '/抽象的问题/用for of替代forEach' }
    ]
  },
  {
    title: '项目文档',
    posts: [
      { title: 'Note协同文档系统', href: '/项目文档/协同文档' },
      { title: 'LJH-Design设计系统', href: '/项目文档/在线画布' },
      { title: '自定义表单设计器', href: '/项目文档/自定义表单' },
      { title: 'Jebet项目管理系统', href: '/项目文档/项目管理系统' }
    ]
  },
  {
    title: '项目的可行性研究',
    posts: [
      { title: '怎么把 Markdown 渲染为网页', href: '/项目的可行性研究/怎么吧md文件渲染为html网页' },
      { title: '画布库(canvas)的调研', href: '/项目的可行性研究/画布库(canvas)的调研' },
      { title: '自定义表单的可行性', href: '/项目的可行性研究/自定义表单的可行性' }
    ]
  },
  {
    title: '建站与专题',
    posts: [
      { title: '基于 Next.js 和 Nextra 搭建个人技术博客', href: '/博客搭建' },
      { title: '流程图的自定义连接', href: '/流程图的自定义连接' },
      { title: '让websocket服务运行在边缘函数中', href: '/让websocket服务运行在边缘函数中/indexs' },
      { title: '重定向码对seo的影响', href: '/重定向码对seo的影响' }
    ]
  }
] as const

export const archivePostCount = archiveGroups.reduce((count, group) => count + group.posts.length, 0)
