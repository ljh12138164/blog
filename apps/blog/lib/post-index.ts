import type { MdxFile, PageMapItem } from 'nextra'
import { getPageMap } from 'nextra/page-map'
import { cache } from 'react'

export type PostSummary = {
  slug: string
  title: string
  description: string
  date: string
  category: string
  readingTime: string
}

function flattenMdxFiles(items: PageMapItem[]): MdxFile[] {
  return items.flatMap((item) => {
    if ('children' in item) {
      return flattenMdxFiles(item.children)
    }

    return 'route' in item ? [item] : []
  })
}

function readRequiredString(metadata: Record<string, unknown>, key: string, route: string) {
  const value = metadata[key]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Article metadata "${key}" is missing for ${route}`)
  }

  return value
}

export const getAllPosts = cache(async (): Promise<PostSummary[]> => {
  const pageMap = await getPageMap('/posts')
  const files = flattenMdxFiles(pageMap).filter((file) => /^\/posts\/[^/]+$/.test(file.route))

  return files
    .map((file) => {
      const metadata = file.frontMatter ?? {}

      return {
        slug: file.route.slice('/posts/'.length),
        title: readRequiredString(metadata, 'title', file.route),
        description: readRequiredString(metadata, 'description', file.route),
        date: readRequiredString(metadata, 'date', file.route),
        category: readRequiredString(metadata, 'category', file.route),
        readingTime: readRequiredString(metadata, 'readingTime', file.route)
      }
    })
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title, 'zh-CN'))
})
