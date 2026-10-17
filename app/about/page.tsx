export const metadata = {
  title: '关于李建辉',
  description:
    '李建辉（ljh）的个人介绍、技术手记与联系方式。记录前端架构、多人实时协同、Web 性能和 AI 工程实践。',
  alternates: { canonical: '/about' },
  openGraph: {
    type: 'profile',
    title: '关于李建辉 · ljh.notes',
    description:
      '李建辉（ljh）的个人介绍、技术手记与联系方式。记录前端架构、多人实时协同、Web 性能和 AI 工程实践。',
    url: '/about',
    images: ['/og-image.png']
  },
  twitter: {
    card: 'summary_large_image',
    title: '关于李建辉 · ljh.notes',
    description:
      '李建辉（ljh）的个人介绍、技术手记与联系方式。记录前端架构、多人实时协同、Web 性能和 AI 工程实践。',
    images: ['/og-image.png']
  }
}

import { profile } from '@/lib/profile'
import { PersonalIntroduction, PersonalSites, PersonalWork } from '../_components/personal-hub'

export default function AboutPage() {
  return (
    <div
      className="mx-auto w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]"
      data-pagefind-body
    >
      <PersonalIntroduction />
      <PersonalSites />
      <PersonalWork />
      <section
        className="border-t border-line pt-10 pb-20"
        aria-labelledby="contact-title"
        id="contact"
      >
        <h2 className="mt-0 mb-5 text-2xl font-bold" id="contact-title">
          联系方式
        </h2>
        <ul className="m-0 list-none space-y-3 p-0 text-sm text-muted">
          <li>
            GitHub：
            <a className="text-accent" href={profile.author.github}>
              {profile.author.nickname}
            </a>
          </li>
          <li>
            Email：
            <a className="text-accent" href={`mailto:${profile.author.email}`}>
              {profile.author.email}
            </a>
          </li>
        </ul>
      </section>
    </div>
  )
}
