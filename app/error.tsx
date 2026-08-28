'use client'

import { useEffect } from 'react'
import { ErrorState } from './_components/error-state'

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ErrorState
      kind="error"
      status="500"
      eyebrow="Render interrupted"
      title="页面暂时无法显示"
      description="这次请求没有顺利完成。你可以重新加载当前页面；如果问题仍然存在，请先返回首页。"
      trace={error.digest ? `RENDER interrupted · reference ${error.digest}` : 'RENDER interrupted'}
      onRetry={reset}
    />
  )
}
