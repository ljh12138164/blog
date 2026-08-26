const siteConfig = require('./site.config.json')

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: siteConfig.url,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  outDir: 'out',
  changefreq: 'weekly',
  priority: 0.7,
  exclude: ['/_pagefind/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/_next/', '/_pagefind/']
      }
    ],
    additionalSitemaps: []
  }
}
