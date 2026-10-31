import siteConfig from '@/site.config.json'
import { profile } from './profile'

export const site = {
  name: 'ljh.notes',
  title: 'ljh.notes - 前端架构、实时协同与 AI 工程化实践',
  description: 'ljh个人技术手记，持续修订，写给下一次遇到同样问题的自己。',
  url: siteConfig.url,
  baiduAnalyticsId: '0f1b632716b21f7c3c7ed60e47890594',
  author: {
    ...profile.author,
    url: `${siteConfig.url}/about`,
    sameAs: [profile.author.github]
  },
  icp: {
    number: '浙ICP备2026067260号-1',
    link: 'https://beian.miit.gov.cn/'
  }
}
