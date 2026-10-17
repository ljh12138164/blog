export interface SkillItem {
  name: string
  category: 'languages' | 'frameworks' | 'ecosystem' | 'tooling' | 'backend'
  iconSlug: string // for skillicons.dev or custom icon
  color?: string
  description?: string
  hot?: boolean
}

export const skillCategories = [
  { id: 'all', name: '全部' },
  { id: 'languages', name: '语言与基础' },
  { id: 'frameworks', name: '框架与全栈' },
  { id: 'ecosystem', name: '生态与状态' },
  { id: 'tooling', name: '构建与工程化' },
  { id: 'backend', name: '服务端与云' }
] as const

export const skills: SkillItem[] = [
  // 语言与基础
  {
    name: 'JavaScript',
    category: 'languages',
    iconSlug: 'js',
    description: '现代 ESNext 标准、异步编程与原型链'
  },
  {
    name: 'TypeScript',
    category: 'languages',
    iconSlug: 'ts',
    description: '严谨类型系统、泛型与工程级类型体操',
    hot: true
  },
  {
    name: 'TSX',
    category: 'languages',
    iconSlug: 'react',
    description: 'JSX 语法与强类型组件模式'
  },
  {
    name: 'HTML5',
    category: 'languages',
    iconSlug: 'html',
    description: '语义化标签、Web Components 与无障碍可访问性'
  },
  {
    name: 'CSS3',
    category: 'languages',
    iconSlug: 'css',
    description: 'Flexbox, Grid, 现代变量系统与 CSS-in-JS'
  },

  // 框架与全栈 (特别包含 Astro 与 Umi)
  {
    name: 'Astro',
    category: 'frameworks',
    iconSlug: 'astro',
    description: '内容优先的零 JS 群岛架构与孤岛渲染 (Island Architecture)',
    hot: true
  },
  {
    name: 'Umi',
    category: 'frameworks',
    iconSlug: 'umi',
    description: '企业级前端应用框架，微前端 qiankun 与路由插件生态',
    hot: true
  },
  {
    name: 'React',
    category: 'frameworks',
    iconSlug: 'react',
    description: 'Hooks, Fiber 调度, 并发特性与组件化架构',
    hot: true
  },
  {
    name: 'Vue.js',
    category: 'frameworks',
    iconSlug: 'vue',
    description: 'Composition API, 响应式原理与高效渲染'
  },
  {
    name: 'Next.js',
    category: 'frameworks',
    iconSlug: 'nextjs',
    description: 'App Router, React Server Components (RSC) 与 SSR/SSG',
    hot: true
  },
  {
    name: 'Nuxt.js',
    category: 'frameworks',
    iconSlug: 'nuxtjs',
    description: 'Vue3 SSR/SSG 全栈元框架与自动路由'
  },
  {
    name: 'Tailwind CSS',
    category: 'frameworks',
    iconSlug: 'tailwind',
    description: '原子化 CSS、设计约束系统与 JIT 引擎'
  },
  {
    name: 'Sass / Less',
    category: 'frameworks',
    iconSlug: 'sass',
    description: 'CSS 预处理器与模块化样式方案'
  },

  // 生态与状态
  {
    name: 'Pinia',
    category: 'ecosystem',
    iconSlug: 'pinia',
    description: 'Vue 3 官方推荐的轻量直观状态管理'
  },
  {
    name: 'Zustand',
    category: 'ecosystem',
    iconSlug: 'zustand',
    description: '极简轻量的 React 状态管理方案'
  },
  {
    name: 'MobX',
    category: 'ecosystem',
    iconSlug: 'mobx',
    description: '透明函数响应式状态管理 (TFRP)'
  },
  {
    name: 'TanStack Query',
    category: 'ecosystem',
    iconSlug: 'react-query',
    description: '异步服务端状态同步与智能缓存 (React Query)'
  },
  {
    name: 'Ant Design',
    category: 'ecosystem',
    iconSlug: 'ant-design',
    description: '企业级中后台 UI 体系与生态组件贡献'
  },
  {
    name: 'Shadcn UI',
    category: 'ecosystem',
    iconSlug: 'shadcn',
    description: '可拷贝定制的 Radix 基础高质量组件原语'
  },
  {
    name: 'React Router',
    category: 'ecosystem',
    iconSlug: 'reactrouter',
    description: '声明式路由系统与数据加载契约'
  },
  {
    name: 'React Hook Form',
    category: 'ecosystem',
    iconSlug: 'hookform',
    description: '高性能、低重渲染的表单校验架构'
  },
  {
    name: 'Zod',
    category: 'ecosystem',
    iconSlug: 'zod',
    description: 'TypeScript 优先的运行时 Schema 校验库'
  },
  {
    name: 'Nextra',
    category: 'ecosystem',
    iconSlug: 'nextra',
    description: '基于 Next.js 的高颜值文档与博客生成引擎'
  },
  {
    name: 'Yjs',
    category: 'ecosystem',
    iconSlug: 'yjs',
    description: '高性能 CRDT 实时富文本协同计算框架'
  },
  {
    name: 'ECharts',
    category: 'ecosystem',
    iconSlug: 'echarts',
    description: '复杂交互数据可视化图表库'
  },

  // 构建与工程化
  {
    name: 'Vite',
    category: 'tooling',
    iconSlug: 'vite',
    description: '基于原生 ESM 的极速现代前端构建工具',
    hot: true
  },
  {
    name: 'Rspack',
    category: 'tooling',
    iconSlug: 'rspack',
    description: '基于 Rust 的高性能 Webpack 兼容打包器'
  },
  {
    name: 'Webpack',
    category: 'tooling',
    iconSlug: 'webpack',
    description: '经典模块打包器、深入 Loader/Plugin 机制'
  },
  {
    name: 'Rollup',
    category: 'tooling',
    iconSlug: 'rollupjs',
    description: '高内聚类库打包与精细 Tree-shaking'
  },
  {
    name: 'Turborepo',
    category: 'tooling',
    iconSlug: 'turborepo',
    description: '高性能 Monorepo 多包管理与远端构建缓存'
  },
  {
    name: 'Turbopack',
    category: 'tooling',
    iconSlug: 'turbopack',
    description: '下一代增量打包引擎'
  },
  {
    name: 'tsup',
    category: 'tooling',
    iconSlug: 'tsup',
    description: '基于 esbuild 的轻快 TypeScript 库打包器'
  },
  {
    name: 'Lighthouse',
    category: 'tooling',
    iconSlug: 'lighthouse',
    description: 'Web 性能、SEO 与可访问性核心体验审计'
  },
  {
    name: 'Biome',
    category: 'tooling',
    iconSlug: 'biome',
    description: '快速的格式化与代码质量 linter 工具'
  },
  {
    name: 'Git & Actions',
    category: 'tooling',
    iconSlug: 'github',
    description: '版本控制、规范提交与自动化 CI/CD 流程'
  },
  {
    name: 'pnpm',
    category: 'tooling',
    iconSlug: 'pnpm',
    description: '硬链接内容寻址的高效磁盘占用包管理器'
  },

  // 服务端与云
  {
    name: 'Node.js',
    category: 'backend',
    iconSlug: 'nodejs',
    description: '事件驱动、异步非阻塞的 JavaScript 服务端运行时'
  },
  {
    name: 'Hono',
    category: 'backend',
    iconSlug: 'hono',
    description: '超轻快、运行于边缘的现代 Web 标准框架'
  },
  {
    name: 'Supabase',
    category: 'backend',
    iconSlug: 'supabase',
    description: '开源 Firebase 替代品，PostgreSQL 驱动的后端即服务'
  },
  {
    name: 'Vercel',
    category: 'backend',
    iconSlug: 'vercel',
    description: '全球边缘托管与自动化 Serverless 部署平台'
  },
  {
    name: 'Socket.io',
    category: 'backend',
    iconSlug: 'socketio',
    description: '双向、低延迟的实时 WebSocket 通信'
  },
  {
    name: 'Gemini AI',
    category: 'backend',
    iconSlug: 'gemini',
    description: '大语言模型 API 集成与智能交互落地'
  },
  {
    name: 'Resend',
    category: 'backend',
    iconSlug: 'resend',
    description: '专为开发者设计的现代事务型邮件服务'
  }
]
