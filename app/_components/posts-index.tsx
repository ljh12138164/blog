'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { filterPosts, getPostsHref, groupPostsByYear } from '@/lib/post-discovery'
import type { PostSummary } from '@/lib/post-index'
import { usePostSearch } from '@/lib/use-post-search'
import { PostList } from './post-list'

export function PostsIndex({ posts, readUrl = true }: { posts: PostSummary[]; readUrl?: boolean }) {
  return readUrl ? (
    <FilteredPosts posts={posts} />
  ) : (
    <PostsContent posts={posts} query="" category="" />
  )
}

function FilteredPosts({ posts }: { posts: PostSummary[] }) {
  const params = useSearchParams()
  return (
    <PostsContent
      posts={posts}
      query={params.get('q')?.trim() ?? ''}
      category={params.get('category') ?? ''}
    />
  )
}

function PostsContent({
  posts,
  query,
  category
}: {
  posts: PostSummary[]
  query: string
  category: string
}) {
  const search = usePostSearch(query)
  const filtered = filterPosts(
    posts,
    category,
    query ? search.results.map((result) => result.url) : undefined
  )
  const groups = groupPostsByYear(filtered)
  const categories = [...new Set(posts.map((post) => post.category))].sort((a, b) =>
    a.localeCompare(b, 'zh-CN')
  )

  return (
    <>
      <form
        action="/posts"
        className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 border-b border-line py-6"
        aria-label="搜索与筛选文章"
      >
        <label className="col-span-2 text-sm font-semibold" htmlFor="post-query">
          搜索全文
        </label>
        <input
          key={query}
          id="post-query"
          name="q"
          type="search"
          defaultValue={query}
          placeholder="搜索标题、正文或代码…"
          className="min-h-11 min-w-0 rounded-md border border-line bg-code px-3 text-base"
        />
        <button
          className="min-h-11 cursor-pointer rounded-md border border-line bg-accent-soft px-4 font-semibold text-accent"
          type="submit"
        >
          搜索
        </button>
        <div className="col-span-2 flex flex-wrap items-center gap-3">
          <label className="text-sm" htmlFor="post-category">
            分类
          </label>
          <select
            id="post-category"
            name="category"
            value={category}
            className="min-h-11 min-w-0 max-w-full rounded-md border border-line bg-paper px-3 text-sm"
            onChange={(event) => {
              const input = new FormData(event.currentTarget.form as HTMLFormElement).get('q')
              window.history.pushState(
                null,
                '',
                getPostsHref(String(input ?? query), event.target.value)
              )
            }}
          >
            <option value="">全部分类（{posts.length}）</option>
            {category && !categories.includes(category) && (
              <option value={category}>{category}（0）</option>
            )}
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}（{posts.filter((post) => post.category === name).length}）
              </option>
            ))}
          </select>
          {(query || category) && (
            <Link href="/posts" className="inline-flex min-h-11 items-center text-sm text-accent">
              清除筛选
            </Link>
          )}
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4">
        <p className="m-0 text-sm text-muted tabular-nums" role="status">
          {search.loading
            ? '正在搜索全文…'
            : search.error
              ? '搜索暂时不可用，请重试。'
              : `${filtered.length} 篇${query ? '搜索结果 · 按时间排序' : '技术手记'}`}
        </p>
        <nav className="flex flex-wrap gap-1" aria-label="按年份跳转">
          {[...groups.keys()].map((year) => (
            <a
              className="inline-flex min-h-11 items-center px-2 font-mono text-xs text-muted hover:text-accent tabular-nums"
              href={`#year-${year}`}
              key={year}
            >
              {year}
            </a>
          ))}
        </nav>
      </div>
      {search.error ? (
        <button
          className="my-8 min-h-11 cursor-pointer text-accent"
          type="button"
          onClick={search.retry}
        >
          重新搜索
        </button>
      ) : !search.loading && filtered.length === 0 ? (
        <section className="py-12">
          <h2 className="text-balance text-2xl font-bold">没有找到匹配的文章</h2>
          <p className="text-pretty text-muted">可以更换关键词，或清除条件浏览全部文章。</p>
          <Link className="inline-flex min-h-11 items-center text-accent" href="/posts">
            查看全部文章 →
          </Link>
        </section>
      ) : (
        <div className="py-8" aria-busy={search.loading}>
          {[...groups].map(([year, yearPosts]) => (
            <section className="scroll-mt-24 py-7" id={`year-${year}`} key={year}>
              <header className="mb-2 flex items-baseline justify-between gap-4 border-b border-line pb-3">
                <h2 className="m-0 font-mono text-xl font-bold text-accent tabular-nums">{year}</h2>
                <p className="m-0 font-mono text-[11px] text-muted tabular-nums">
                  {yearPosts.length} NOTES
                </p>
              </header>
              <PostList posts={yearPosts} />
            </section>
          ))}
        </div>
      )}
    </>
  )
}
