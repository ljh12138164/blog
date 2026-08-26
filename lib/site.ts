import siteConfig from '@/site.config.json'

export const site = {
  name: 'ljh的技术博客',
  title: 'ljh的技术博客 - 前端架构、实时协同与 AI 工程化实践',
  description:
    '专注分享前端架构设计、多人实时协同（CRDT/OT）、现代 Web 性能调优、全栈边缘计算与 AI 大模型（LLM/Agent）工程化落地实践的技术博客。',
  url: siteConfig.url,
  author: {
    name: '李建辉',
    englishName: 'ljh',
    url: 'https://blog.ljhboard.cn/about',
    github: 'https://github.com/ljh12138164',
    jobTitle: '前端全干工程师',
    sameAs: [
      'https://github.com/ljh12138164'
    ]
  },
  icp: {
    number: '浙ICP备2026067260号-1',
    link: 'https://beian.miit.gov.cn/'
  }
}
