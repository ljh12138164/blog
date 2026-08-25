import type { Metadata } from 'next'
import { Head } from 'nextra/components'
import type { ReactNode } from 'react'
import { SiteShell } from './_components/site-shell'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: `%s · ${site.name}`
  },
  description: site.description,
  alternates: { canonical: '/' },
  authors: [{ name: site.author.name, url: site.author.url }],
  creator: site.author.name,
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: site.name,
    title: site.title,
    description: site.description,
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: site.title,
    description: site.description
  }
}

const websiteAndPersonJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: site.url,
      name: site.name,
      description: site.description,
      inLanguage: 'zh-CN',
      publisher: {
        '@id': `${site.url}/#author`
      }
    },
    {
      '@type': 'Person',
      '@id': `${site.url}/#author`,
      name: site.author.name,
      alternateName: site.author.englishName,
      url: site.author.url,
      jobTitle: site.author.jobTitle,
      sameAs: site.author.sameAs,
      description: '热爱技术的前端架构师与全栈开发者，专注前端架构、协同架构与 AI 工程化实践。'
    }
  ]
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <Head faviconGlyph="✦" />
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteAndPersonJsonLd) }}
        />
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
