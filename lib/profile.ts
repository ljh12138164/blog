// Migrated from the self site homepage-content worktree (5c53bca).
export const profile = {
  author: {
    name: '李建辉',
    englishName: 'ljh',
    nickname: 'ljh12138164',
    jobTitle: '前端全干工程师',
    location: '中国 · 浙江',
    email: '3479261099@qq.com',
    github: 'https://github.com/ljh12138164',
    bio: '写前端的，平时做点实用的小工具，偶尔给开源项目提提 PR。',
    quote: '代码跑得通、页面不卡顿，一天就挺踏实。',
    avatar: '/profile/avatar.webp',
    tags: [
      '前端全干',
      'TypeScript',
      'React',
      'Vue',
      'Astro',
      'Umi',
      'Next.js',
      '性能优化',
      '开源贡献',
      '极客'
    ]
  },
  sites: [
    {
      id: 'blog',
      name: 'ljh 的技术博客',
      short: '长文与手记',
      url: '/posts',
      preview: '/profile/blog.webp',
      description: '前端架构、协同算法和性能优化方面的踩坑手记与长文复盘。',
      category: '写作'
    },
    {
      id: 'tools',
      name: 'LJH Tools',
      short: '18 个在线工具',
      url: 'https://tools.ljhboard.cn',
      preview: '/profile/tools.webp',
      description: '常用编码、格式化和哈希工具，纯浏览器本地跑，不传服务器。',
      category: '工具'
    },
    {
      id: 'token',
      name: 'Token Paper',
      short: 'Token 计算器',
      url: 'https://token.ljhboard.cn',
      preview: '/profile/token.webp',
      description: '算大模型 Token 成本用的，支持常见模型本地分词和官方计费。',
      category: '实验'
    },
    {
      id: 'news',
      name: '今日热点',
      short: '热榜与资讯',
      url: 'https://news.ljhboard.cn',
      preview: '/profile/news.webp',
      description: '抓各大平台的科技与热搜榜，每天刷一遍，省得一个个网站到处翻。',
      category: '资讯'
    }
  ],
  projects: [
    {
      name: 'ant-design/pro-components',
      repo: 'ant-design/pro-components',
      tag: 'Public',
      description: '🏆 Use Ant Design like a Pro!',
      url: 'https://github.com/ant-design/pro-components',
      stars: '4.8k',
      forks: '1.4k',
      lang: 'TypeScript',
      langColor: '#3178c6',
      contribution: {
        title: '修复 ProTable 嵌套列的显示联动',
        problem: '取消父列的全选状态后，再选中子列，表格仍不显示对应内容。',
        work: '调整嵌套列选择逻辑，让勾选子列时同步恢复父列显示，并补充嵌套时间列示例。',
        pr: 'https://github.com/ant-design/pro-components/pull/9226',
        number: 9226,
        status: 'merged',
        checkedAt: '2026-10-02',
        image: {
          url: '/profile/pro-components.png',
          alt: 'ProTable 修复后，嵌套时间列勾选与表格显示同步的截图',
          width: 1602,
          height: 660
        }
      }
    },
    {
      name: 'vantezzen/autoform',
      repo: 'vantezzen/autoform',
      tag: 'Public',
      description: '🌟 Automatically render forms for your existing data schema',
      url: 'https://github.com/vantezzen/autoform',
      stars: '3.5k',
      forks: '148',
      lang: 'TypeScript',
      langColor: '#3178c6',
      contribution: {
        title: '为 AutoForm 新增 Ant Design 支持',
        problem: '希望用 Ant Design 组件承接基于数据模式自动生成表单的能力。',
        work: '提交 Ant Design 集成，覆盖普通字段、嵌套对象与数组表单的展示和交互。',
        pr: 'https://github.com/vantezzen/autoform/pull/145',
        number: 145,
        status: 'merged',
        checkedAt: '2026-10-02',
        image: {
          url: '/profile/autoform.png',
          alt: 'AutoForm 使用 Ant Design 自动生成普通字段表单的截图',
          width: 1601,
          height: 1029
        }
      }
    },
    {
      name: 'DIYgod/RSSHub',
      repo: 'DIYgod/RSSHub',
      tag: 'Public',
      description: '🧡 Everything is RSSible',
      url: 'https://github.com/DIYgod/RSSHub',
      stars: '46.3k',
      forks: '10.2k',
      lang: 'TypeScript',
      langColor: '#3178c6',
      contribution: {
        title: '新增 DeepSeek API 更新日志订阅路由',
        problem: '将 DeepSeek 官方 API 的中英文更新日志转成可订阅的 RSS。',
        work: '按日期拆分更新条目，提取标题、正文与来源锚点，补充 Radar 规则、双语文档和解析测试。',
        pr: 'https://github.com/DIYgod/RSSHub/pull/23259',
        number: 23259,
        status: 'open',
        checkedAt: '2026-10-02',
        image: null
      }
    }
  ],
  quickTools: [
    {
      name: 'JSON 格式化',
      slug: 'json-formatter',
      description: '格式化、压缩与语法校验'
    },
    {
      name: '时间戳转换',
      slug: 'timestamp-converter',
      description: 'Unix 时间戳与日期互转'
    },
    {
      name: 'Base64 编解码',
      slug: 'base64',
      description: '文本与 Base64 互转'
    }
  ]
} as const
