'use client'

import * as AlertDialog from '@radix-ui/react-alert-dialog'
import Link from 'next/link'
import { type FormEvent, useEffect, useRef, useState } from 'react'
import { JournalError, journalRequest, type Note, type NotePage, noteDate } from '@/lib/journal'
import { JournalButton, JournalLoading, JournalMessage } from './journal-ui'

export function JournalWriter() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [content, setContent] = useState('')
  const [hidden, setHidden] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [hasMore, setHasMore] = useState(false)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [deleting, setDeleting] = useState<Note | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const editor = useRef<HTMLTextAreaElement>(null)
  const deleteTrigger = useRef<HTMLButtonElement | null>(null)

  function report(cause: unknown) {
    if (cause instanceof JournalError && cause.status === 401) {
      setAuthenticated(false)
      setNotes([])
      setDeleting(null)
    }
    setError(cause instanceof Error ? cause.message : '操作失败，请重试。')
  }

  useEffect(() => {
    const controller = new AbortController()
    journalRequest('/auth/session', { signal: controller.signal })
      .then(() => setAuthenticated(true))
      .catch((cause) => {
        if (controller.signal.aborted) return
        if (!(cause instanceof JournalError && cause.status === 401))
          setError(cause.message || '读取失败，请重试。')
        setAuthenticated(false)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!authenticated) return
    const controller = new AbortController()
    setLoading(true)
    journalRequest<NotePage>('/admin/notes', { signal: controller.signal })
      .then((page) => {
        setNotes(page.notes)
        setHasMore(page.hasMore)
        setError('')
      })
      .catch((cause) => {
        if (!controller.signal.aborted) report(cause)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })
    return () => controller.abort()
  }, [authenticated, attempt])

  async function login(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      await journalRequest('/auth/login', { method: 'POST', body: JSON.stringify({ password }) })
      setPassword('')
      setAuthenticated(true)
    } catch (cause) {
      report(cause)
    } finally {
      setBusy(false)
    }
  }

  async function save(event: FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const note = await journalRequest<Note>(
        editing ? `/admin/notes/${editing}` : '/admin/notes',
        {
          method: editing ? 'PATCH' : 'POST',
          body: JSON.stringify({ content, hidden })
        }
      )
      setNotes((current) =>
        editing ? current.map((item) => (item.id === note.id ? note : item)) : [note, ...current]
      )
      setContent('')
      setHidden(false)
      setEditing(null)
      setMessage(note.hidden ? '已保存，仅自己可见。' : '已保存，随笔已公开。')
    } catch (cause) {
      report(cause)
    } finally {
      setBusy(false)
    }
  }

  async function toggle(note: Note) {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const updated = await journalRequest<Note>(`/admin/notes/${note.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ hidden: !note.hidden })
      })
      setNotes((current) => current.map((item) => (item.id === note.id ? updated : item)))
      if (editing === note.id) setHidden(updated.hidden)
      setMessage(updated.hidden ? '已隐藏，仅自己可见。' : '已恢复公开。')
    } catch (cause) {
      report(cause)
    } finally {
      setBusy(false)
    }
  }

  async function remove() {
    if (!deleting) return
    setBusy(true)
    setDeleteError('')
    setMessage('')
    try {
      await journalRequest(`/admin/notes/${deleting.id}`, { method: 'DELETE' })
      setNotes((current) => current.filter((note) => note.id !== deleting.id))
      if (editing === deleting.id) {
        setEditing(null)
        setContent('')
        setHidden(false)
      }
      setDeleting(null)
      setMessage('随笔已删除。')
    } catch (cause) {
      if (cause instanceof JournalError && cause.status === 401) report(cause)
      else setDeleteError(cause instanceof Error ? cause.message : '删除失败，请重试。')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setBusy(true)
    setError('')
    try {
      await journalRequest('/auth/logout', { method: 'POST' })
      setAuthenticated(false)
      setNotes([])
      setContent('')
      setEditing(null)
      setHidden(false)
      setMessage('')
    } catch (cause) {
      report(cause)
    } finally {
      setBusy(false)
    }
  }

  async function loadMore() {
    setLoading(true)
    setError('')
    try {
      const page = await journalRequest<NotePage>(`/admin/notes?offset=${notes.length}`)
      setNotes((current) => [
        ...new Map([...current, ...page.notes].map((note) => [note.id, note])).values()
      ])
      setHasMore(page.hasMore)
    } catch (cause) {
      report(cause)
    } finally {
      setLoading(false)
    }
  }

  if (authenticated === null) return <JournalLoading />
  if (!authenticated)
    return (
      <form className="max-w-sm space-y-4 py-8" onSubmit={login}>
        <label className="block text-sm font-medium" htmlFor="journal-password">
          写作密码
        </label>
        <input
          id="journal-password"
          type="password"
          autoComplete="current-password"
          required
          maxLength={1024}
          className="min-h-11 w-full rounded-sm border border-line bg-code px-3"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
        {error && <JournalMessage error>{error}</JournalMessage>}
        <JournalButton type="submit" disabled={busy}>
          {busy ? '正在验证…' : '进入写作'}
        </JournalButton>
      </form>
    )

  return (
    <>
      <div className="flex items-center justify-between gap-4 py-6">
        <Link href="/notes" className="inline-flex min-h-11 items-center text-sm text-accent">
          查看公开随笔 →
        </Link>
        <JournalButton onClick={() => void logout()} disabled={busy}>
          退出写作
        </JournalButton>
      </div>
      <form onSubmit={save} className="space-y-4 border-b border-line pb-8" aria-label="随笔编辑器">
        <label htmlFor="journal-content" className="block text-lg font-bold">
          {editing ? '编辑随笔' : '今天想记下什么？'}
        </label>
        <textarea
          ref={editor}
          id="journal-content"
          rows={7}
          required
          maxLength={20000}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          disabled={busy}
          className="w-full resize-y rounded-sm border border-line bg-code p-4 text-base leading-8"
          placeholder="一件小事、一点感受，或者还没想明白的问题。"
        />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <label className="inline-flex min-h-11 items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={hidden}
              disabled={busy}
              onChange={(event) => setHidden(event.target.checked)}
              className="size-4 accent-accent"
            />
            仅自己可见
          </label>
          <div className="flex gap-3">
            {editing && (
              <JournalButton
                disabled={busy}
                onClick={() => {
                  setEditing(null)
                  setContent('')
                  setHidden(false)
                }}
              >
                取消编辑
              </JournalButton>
            )}
            <JournalButton type="submit" disabled={busy || loading || !content.trim()}>
              {busy ? '正在保存…' : editing ? '保存修改' : hidden ? '保存随笔' : '发布随笔'}
            </JournalButton>
          </div>
        </div>
        <p className="m-0 text-pretty text-xs leading-6 text-muted">
          默认公开。勾选“仅自己可见”可以先留给自己。
        </p>
      </form>
      {message && <JournalMessage>{message}</JournalMessage>}
      {error && (
        <>
          <JournalMessage error>{error}</JournalMessage>
          <JournalButton
            disabled={loading || busy}
            onClick={() => setAttempt((current) => current + 1)}
          >
            重新读取历史随笔
          </JournalButton>
        </>
      )}
      <section className="pt-8" aria-labelledby="journal-history">
        <h2 id="journal-history" className="m-0 text-balance text-xl font-bold">
          之前的随笔
        </h2>
        {notes.map((note) => (
          <article key={note.id} className="border-b border-line py-6">
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted tabular-nums">
              <time dateTime={note.createdAt}>{noteDate(note.createdAt)}</time>
              <span className="rounded-sm bg-code px-2 py-1">
                {note.hidden ? '仅自己可见' : '公开'}
              </span>
            </div>
            <p className="my-4 whitespace-pre-wrap break-words text-pretty leading-8">
              {note.content}
            </p>
            <div className="flex flex-wrap gap-3">
              <JournalButton
                disabled={busy}
                onClick={() => {
                  setEditing(note.id)
                  setContent(note.content)
                  setHidden(note.hidden)
                  setMessage('')
                  editor.current?.focus()
                }}
              >
                编辑
              </JournalButton>
              <JournalButton disabled={busy} onClick={() => void toggle(note)}>
                {note.hidden ? '恢复公开' : '隐藏'}
              </JournalButton>
              <JournalButton
                disabled={busy}
                onClick={(event) => {
                  deleteTrigger.current = event.currentTarget
                  setDeleteError('')
                  setDeleting(note)
                }}
              >
                删除
              </JournalButton>
            </div>
          </article>
        ))}
        {loading && <JournalLoading />}
        {!loading && !error && !notes.length && (
          <JournalMessage>还没有随笔，从上面记下第一篇。</JournalMessage>
        )}
        {hasMore && (
          <div className="py-6">
            <JournalButton disabled={loading || busy} onClick={() => void loadMore()}>
              更早的随笔
            </JournalButton>
          </div>
        )}
      </section>
      <AlertDialog.Root
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setDeleting(null)
        }}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-40 bg-ink/30" />
          <AlertDialog.Content
            onCloseAutoFocus={(event) => {
              event.preventDefault()
              if (deleteTrigger.current?.isConnected) deleteTrigger.current.focus()
              else editor.current?.focus()
            }}
            className="fixed top-1/2 left-1/2 z-50 w-[calc(100%_-_32px)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sm border border-line bg-paper p-6"
          >
            <AlertDialog.Title className="m-0 text-balance text-xl font-bold">
              删除这篇随笔？
            </AlertDialog.Title>
            <AlertDialog.Description className="my-4 text-pretty text-sm leading-7 text-muted">
              删除后无法恢复。如果只是暂时不想公开，可以选择隐藏。
            </AlertDialog.Description>
            {deleteError && <JournalMessage error>{deleteError}</JournalMessage>}
            <div className="flex justify-end gap-3">
              <AlertDialog.Cancel asChild>
                <JournalButton disabled={busy}>保留</JournalButton>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <JournalButton
                  disabled={busy}
                  onClick={(event) => {
                    event.preventDefault()
                    void remove()
                  }}
                >
                  {busy ? '正在删除…' : '确认删除'}
                </JournalButton>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  )
}
