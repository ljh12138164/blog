import type { Metadata } from 'next'
import { ErrorState } from './_components/error-state'

export const metadata: Metadata = {
  title: '页面未找到',
  robots: { index: false, follow: false }
}

export default function NotFound() {
  return (
    <ErrorState
      kind="not-found"
      status="404"
      eyebrow="Route not found"
      title="页面没有找到"
      description="这个地址可能已经失效，或者页面被移动到了别处。你可以回到首页，或从文章目录重新开始。"
      trace="GET /requested-page → no matching route"
    />
  )
}
