import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Head } from 'nextra/components'
import type { ReactNode } from 'react'
import { site } from '@/lib/site'
import { themeInitScript } from '@/lib/theme'
import { SiteShell } from './_components/site-shell'
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

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfdfc' },
    { media: '(prefers-color-scheme: dark)', color: '#15191b' }
  ]
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
    <html lang="zh-CN" suppressHydrationWarning>
      <Head backgroundColor={{ light: '#fdfdfc', dark: '#15191b' }}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <meta name="baidu-site-verification" content="codeva-IiA93WOaG7" />
        <meta name="msvalidate.01" content="DD5A2B7DB351923A5E482555DC0A57C4" />
        <link rel="dns-prefetch" href="https://static.cloudflareinsights.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7441827328189379"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${site.googleAnalyticsId}');
          `}
        </Script>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${site.googleAnalyticsId}`}
          strategy="afterInteractive"
        />
        <Script
          id="umami-analytics"
          defer
          src="/stats/script.js"
          data-website-id="e61fca0c-3e46-4f5c-aeda-ae30990ef482"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteAndPersonJsonLd) }}
        />
      </Head>
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
