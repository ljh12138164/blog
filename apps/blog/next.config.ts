import nextra from 'nextra'

const withNextra = nextra({
  defaultShowCopyCode: true
})

export default withNextra({
  reactStrictMode: true,
  output: process.env.NODE_ENV === 'development' ? undefined : 'export',
  poweredByHeader: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false
  },
  images: {
    unoptimized: true
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        async rewrites() {
          return [{ source: '/api/:path*', destination: 'http://127.0.0.1:3001/api/:path*' }]
        }
      }
    : {}),
  turbopack: {
    resolveAlias: {
      'next-mdx-import-source-file': './mdx-components.tsx'
    }
  }
})
