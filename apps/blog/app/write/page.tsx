import type { Metadata } from 'next'
import { JournalWriter } from '../_components/journal-writer'

export const metadata: Metadata = {
  title: '写随笔',
  alternates: { canonical: '/write' },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } }
}

export default function WritePage() {
  return (
    <div
      className="mx-auto mb-24 w-[min(720px,calc(100%_-_40px))] max-md:w-[calc(100%_-_28px)]"
      data-pagefind-ignore
    >
      <header className="border-b border-line py-12">
        <h1 className="m-0 text-balance text-4xl font-extrabold">写随笔</h1>
        <p className="mt-4 mb-0 text-pretty leading-7 text-muted">
          把今天想留下的几句话，记在这里。
        </p>
      </header>
      <JournalWriter />
    </div>
  )
}
