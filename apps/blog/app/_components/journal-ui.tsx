'use client'

import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function JournalButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center justify-center rounded-sm border border-line px-4 text-sm font-medium hover:bg-code disabled:cursor-not-allowed disabled:opacity-50"
      {...props}
    />
  )
}

export function JournalMessage({
  children,
  error = false
}: {
  children: ReactNode
  error?: boolean
}) {
  return (
    <p className="my-4 text-pretty text-sm leading-6 text-muted" role={error ? 'alert' : 'status'}>
      {children}
    </p>
  )
}

export function JournalLoading() {
  return (
    <div className="space-y-8 py-8" role="status" aria-label="正在读取随笔">
      {[0, 1].map((item) => (
        <div className="space-y-3" key={item} aria-hidden="true">
          <div className="h-3 w-28 rounded-sm bg-code" />
          <div className="h-4 w-full rounded-sm bg-code" />
          <div className="h-4 w-2/3 rounded-sm bg-code" />
        </div>
      ))}
      <span className="sr-only">正在读取随笔…</span>
    </div>
  )
}
