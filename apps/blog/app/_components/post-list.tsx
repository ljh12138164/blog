import Link from 'next/link'
import type { PostSummary } from '@/lib/post-index'

export function PostList({ posts, ordered = false }: { posts: PostSummary[]; ordered?: boolean }) {
  return (
    <ol className="m-0 list-none p-0">
      {posts.map((post, index) => (
        <li className="border-b border-line py-6" key={post.slug}>
          <article className="grid grid-cols-[92px_minmax(0,1fr)] gap-5 max-sm:grid-cols-1 max-sm:gap-2">
            <div className="font-mono text-[11px] leading-5 text-muted tabular-nums">
              {ordered ? (
                <span className="text-accent">第 {index + 1} 篇</span>
              ) : (
                <time dateTime={post.date}>{post.date.slice(5).replace('-', '.')}</time>
              )}
              <p className="m-0 text-pretty">{post.category}</p>
            </div>
            <div className="min-w-0">
              <h3 className="m-0 text-balance text-xl leading-[1.45] font-bold">
                <Link
                  className="inline-flex min-h-11 items-center no-underline hover:text-accent"
                  href={`/posts/${post.slug}`}
                >
                  {post.title}
                </Link>
              </h3>
              <p className="mt-2 mb-3 max-w-[620px] text-pretty text-sm leading-6 text-muted">
                {post.description}
              </p>
              <p className="m-0 font-mono text-[10px] text-muted tabular-nums">
                {post.readingTime}
              </p>
            </div>
          </article>
        </li>
      ))}
    </ol>
  )
}
