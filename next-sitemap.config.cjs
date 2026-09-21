const siteConfig = require('./site.config.json')

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: siteConfig.url,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: 'out',
  exclude: ['/_pagefind/*'],
  transform: async (config, loc) => {
    let priority = 0.7
    let changefreq = 'weekly'

    if (loc === '/' || loc === siteConfig.url || loc === `${siteConfig.url}/`) {
      priority = 1.0
      changefreq = 'daily'
    } else if (loc === '/posts' || loc === `${siteConfig.url}/posts`) {
      priority = 0.9
      changefreq = 'daily'
    } else if (loc.includes('/posts/')) {
      priority = 0.8
      changefreq = 'weekly'
    } else if (loc.includes('/about')) {
      priority = 0.6
      changefreq = 'monthly'
    } else if (loc.includes('/privacy')) {
      priority = 0.3
      changefreq = 'yearly'
    }

    return {
      loc,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? []
    }
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/_pagefind/']
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/_next/', '/_pagefind/']
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/_next/', '/_pagefind/']
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/_next/', '/_pagefind/']
      },
      {
        userAgent: 'Applebot-Extended',
        allow: '/',
        disallow: ['/_next/', '/_pagefind/']
      }
    ],
    additionalSitemaps: []
  }
}
