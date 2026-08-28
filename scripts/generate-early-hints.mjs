import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const LINK_TAG_PATTERN = /<link\b[^>]*>/gi
const ATTRIBUTE_PATTERN = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g

async function findHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await findHtmlFiles(entryPath)))
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      files.push(entryPath)
    }
  }

  return files
}

function parseAttributes(tag) {
  const attributes = new Map()
  const source = tag.slice('<link'.length, -1)

  for (const match of source.matchAll(ATTRIBUTE_PATTERN)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match
    attributes.set(name.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted ?? '')
  }

  return attributes
}

function extractEarlyHints(html) {
  const hints = new Set()

  for (const tag of html.match(LINK_TAG_PATTERN) ?? []) {
    const attributes = parseAttributes(tag)
    const href = attributes.get('href')
    const relations = new Set((attributes.get('rel') ?? '').toLowerCase().split(/\s+/))

    if (!href) continue

    if (relations.has('stylesheet')) {
      hints.add(`<${href}>; rel=preload; as=style`)
      continue
    }

    if (relations.has('preconnect')) {
      const crossOriginValue = attributes.get('crossorigin')?.toLowerCase()
      const crossOrigin = attributes.has('crossorigin')
        ? `; crossorigin=${crossOriginValue === 'use-credentials' ? 'use-credentials' : 'anonymous'}`
        : ''
      hints.add(`<${href}>; rel=preconnect${crossOrigin}`)
    }
  }

  return [...hints]
}

function routeFromHtmlFile(exportDir, filePath) {
  const relativePath = path.relative(exportDir, filePath).split(path.sep).join('/')

  if (relativePath === 'index.html') return '/'
  if (relativePath === '404.html' || relativePath === '_not-found.html') return null

  const withoutExtension = relativePath.slice(0, -'.html'.length)
  const route = withoutExtension.endsWith('/index')
    ? withoutExtension.slice(0, -'/index'.length)
    : withoutExtension

  return `/${route}`
}

function escapeNginxValue(value) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"').replaceAll('$', '\\$')
}

export async function generateEarlyHintsMap(exportDir) {
  const mappings = []
  const routes = new Set()

  for (const filePath of await findHtmlFiles(exportDir)) {
    const route = routeFromHtmlFile(exportDir, filePath)
    if (!route) continue

    if (routes.has(route)) {
      throw new Error(`Multiple HTML files map to the Early Hints route ${route}`)
    }
    if (
      [...route].some((character) => {
        const codePoint = character.codePointAt(0)
        return codePoint !== undefined && (codePoint <= 0x1f || codePoint === 0x7f)
      })
    ) {
      throw new Error(`Early Hints route contains unsupported control characters: ${route}`)
    }

    const hints = extractEarlyHints(await readFile(filePath, 'utf8'))
    if (hints.length === 0) continue

    routes.add(route)
    mappings.push([route, hints.join(', ')])
  }

  mappings.sort(([left], [right]) => left.localeCompare(right, 'en'))

  const lines = [
    'map $request_uri $early_hints_request_path {',
    '    ~^([^?]*) $1;',
    '}',
    '',
    'map $early_hints_request_path $early_hints_link {',
    '    default "";',
    ''
  ]
  for (const [route, hints] of mappings) {
    lines.push(`    "${escapeNginxValue(route)}" "${escapeNginxValue(hints)}";`)
  }
  lines.push('}', '')

  return lines.join('\n')
}

async function main() {
  const exportDir = path.resolve(process.argv[2] ?? 'out')
  const outputPath = path.resolve(process.argv[3] ?? '.next/early-hints-map.conf')
  const config = await generateEarlyHintsMap(exportDir)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, config, 'utf8')
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await main()
}
