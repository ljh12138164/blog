export const metadata = {
  title: '关于李建辉',
  description:
    '关于李建辉（ljh）与技术博客：专注前端架构、多人实时协同、Web 性能工程与 AI 落地实践的个人手记与联系方式。',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    title: '关于李建辉 · ljh.notes',
    description:
      '关于李建辉（ljh）与技术博客：专注前端架构、多人实时协同、Web 性能工程与 AI 落地实践的个人手记与联系方式。',
    url: '/about',
    images: ['/og-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: '关于李建辉 · ljh.notes',
    description:
      '关于李建辉（ljh）与技术博客：专注前端架构、多人实时协同、Web 性能工程与 AI 落地实践的个人手记与联系方式。',
    images: ['/og-image.png']
  }
}

import { Fragment } from 'react'
import {
  PersonalIntroduction,
  PersonalNotes,
  PersonalSites,
  PersonalWork
} from '../_components/personal-hub'
import WritingNotes from './notes.mdx'

export default function AboutPage() {
  return (
    <div
      className="mx-auto w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]"
      data-pagefind-body
    >
      <PersonalIntroduction />
      <PersonalSites />
      <PersonalNotes />
      <PersonalWork />
      <section
        className="article-content prose prose-lg max-w-none border-t border-line pt-10 pb-20 text-ink prose-headings:text-balance prose-headings:text-ink prose-p:text-pretty prose-p:leading-8 prose-p:text-muted prose-a:text-accent prose-strong:text-ink prose-li:text-muted"
        aria-label="做事与写作说明"
      >
        <WritingNotes components={{ wrapper: Fragment }} />
      </section>
    </div>
  )
}
