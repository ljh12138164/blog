import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'
import { Article } from './app/_components/article'
import { CodeBlock } from './app/_components/code-block'

const nextraComponents = getNextraComponents({
  wrapper: Article,
  pre: CodeBlock
})

export function useMDXComponents(components = {}) {
  return {
    ...nextraComponents,
    ...components
  }
}
