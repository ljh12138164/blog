import type { Metadata } from 'next'
import { NotesFeed } from '../_components/notes-feed'

export const metadata: Metadata = {
  title: '随笔',
  description: '记下日常里的一些片段、感受和想法。',
  alternates: { canonical: '/notes' },
  openGraph: {
    title: '随笔 · ljh.notes',
    description: '记下日常里的一些片段、感受和想法。',
    url: '/notes'
  }
}

export default function NotesPage() {
  return (
    <div className="mx-auto mb-24 w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]">
      <header className="border-b border-line py-16 max-md:py-12" data-pagefind-ignore>
        <p className="m-0 font-mono text-[11px] font-bold text-accent">DAILY NOTES</p>
        <h1 className="mt-4 mb-5 text-balance text-5xl font-extrabold max-md:text-4xl">随笔</h1>
        <p className="m-0 text-pretty text-base leading-8 text-muted">
          日常里的一些片段、感受和想法。几句话，也留在这里。
        </p>
      </header>
      <NotesFeed />
    </div>
  )
}
