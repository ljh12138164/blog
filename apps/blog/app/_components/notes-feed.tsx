'use client'

import { useEffect, useState } from 'react'
import { journalRequest, type Note, type NotePage, noteDate } from '@/lib/journal'
import { JournalButton, JournalLoading, JournalMessage } from './journal-ui'

export function NotesFeed() {
  const [notes, setNotes] = useState<Note[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    journalRequest<NotePage>('/notes', { signal: controller.signal })
      .then((page) => {
        setNotes(page.notes)
        setHasMore(page.hasMore)
        setError('')
      })
      .catch((cause) => {
        if (!controller.signal.aborted) setError(cause.message || '读取失败，请重试。')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [attempt])

  async function loadMore() {
    setLoading(true)
    setError('')
    try {
      const page = await journalRequest<NotePage>(`/notes?offset=${notes.length}`)
      setNotes((current) => [
        ...new Map([...current, ...page.notes].map((note) => [note.id, note])).values()
      ])
      setHasMore(page.hasMore)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '读取失败，请重试。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section aria-label="公开随笔" data-pagefind-ignore>
      {notes.map((note) => (
        <article key={note.id} className="border-b border-line py-8">
          <time dateTime={note.createdAt} className="font-mono text-xs text-muted tabular-nums">
            {noteDate(note.createdAt)}
          </time>
          <p className="mt-4 mb-0 whitespace-pre-wrap break-words text-pretty text-base leading-8">
            {note.content}
          </p>
        </article>
      ))}
      {loading && <JournalLoading />}
      {error && (
        <>
          <JournalMessage error>{error}</JournalMessage>
          <JournalButton
            disabled={loading}
            onClick={() => {
              if (notes.length) void loadMore()
              else {
                setLoading(true)
                setAttempt((current) => current + 1)
              }
            }}
          >
            重新读取
          </JournalButton>
        </>
      )}
      {!loading && !error && !notes.length && (
        <JournalMessage>还没有公开的随笔，过些时候再来看看。</JournalMessage>
      )}
      {hasMore && !error && (
        <div className="py-8">
          <JournalButton disabled={loading} onClick={() => void loadMore()}>
            更早的随笔
          </JournalButton>
        </div>
      )}
    </section>
  )
}
