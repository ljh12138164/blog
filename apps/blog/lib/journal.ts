export type Note = {
  id: string
  content: string
  hidden: boolean
  createdAt: string
  updatedAt: string
}

export type NotePage = { notes: Note[]; hasMore: boolean }

export class JournalError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message)
  }
}

export async function journalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', 'X-Journal-Request': '1', ...init.headers }
  }).catch((cause) => {
    if (init.signal?.aborted) throw cause
    throw new JournalError('暂时无法连接随笔服务，请稍后重试。', 0)
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message =
      response.status === 429
        ? '尝试次数过多，请一分钟后再试。'
        : typeof body?.message === 'string' && response.status < 500
          ? body.message
          : '暂时无法连接随笔服务，请稍后重试。'
    throw new JournalError(message, response.status)
  }
  return response.status === 204 ? (undefined as T) : response.json()
}

export function noteDate(value: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(value))
}
