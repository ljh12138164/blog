import type { ImageProps } from 'next/image'
import { ImageZoom } from 'nextra/components'
import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'
import { Article } from './app/_components/article'
import { CodeBlock } from './app/_components/code-block'

function OptimizedImage(props: ImageProps) {
  return (
    <ImageZoom
      loading="lazy"
      className="my-6 rounded-lg border border-line"
      {...props}
      alt={props.alt || '技术手记配图 · ljh.notes'}
    />
  )
}

const nextraComponents = getNextraComponents({
  wrapper: Article,
  pre: CodeBlock,
  img: OptimizedImage
})

export function useMDXComponents(components = {}) {
  return {
    ...nextraComponents,
    ...components
  }
}
