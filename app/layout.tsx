import type { Metadata } from 'next'
import { Head } from 'nextra/components'
import type { ReactNode } from 'react'
import { SiteShell } from './_components/site-shell'
import { site } from '@/lib/site'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s · ${site.name}`
  },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: site.name,
    title: site.name,
    description: site.description,
    url: '/'
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description
  }
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <Head faviconGlyph="✦" />
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  )
}
