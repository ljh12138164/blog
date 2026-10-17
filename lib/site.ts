import siteConfig from '@/site.config.json'

export const site = {
  name: 'ljh.notes',
  title: 'ljh.notes - 前端架构、实时协同与 AI 工程化实践',
  description: 'ljh个人技术手记，持续修订，写给下一次遇到同样问题的自己。',
  url: siteConfig.url,
  googleAnalyticsId: 'G-CNJ6XX4XBJ',
  baiduAnalyticsId: '0f1b632716b21f7c3c7ed60e47890594',
  author: {
    name: '李建辉',
    englishName: 'ljh',
    url: `${siteConfig.url}/about`,
    github: 'https://github.com/ljh12138164',
    jobTitle: '前端全干工程师',
    sameAs: ['https://github.com/ljh12138164']
  },
  icp: {
    number: '浙ICP备2026067260号-1',
    link: 'https://beian.miit.gov.cn/'
  }
}
