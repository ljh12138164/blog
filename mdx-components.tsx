import { useMDXComponents as getNextraComponents } from 'nextra/mdx-components'
import { Article } from './app/_components/article'

const nextraComponents = getNextraComponents({
  wrapper: Article
})

export function useMDXComponents(components = {}) {
  return {
    ...nextraComponents,
    ...components
  }
}
