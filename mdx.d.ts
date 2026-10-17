declare module '*.mdx' {
  import type { ComponentType, ElementType } from 'react'

  const MDXContent: ComponentType<{ components?: { wrapper?: ElementType } }>
  export default MDXContent
}
