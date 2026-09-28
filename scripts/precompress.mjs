import { readdir, readFile, stat, utimes, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { gzipSync } from 'node:zlib'

const COMPRESSIBLE_EXTENSIONS = new Set([
  '.html',
  '.css',
  '.js',
  '.mjs',
  '.json',
  '.xml',
  '.txt',
  '.svg'
])

const MIN_SIZE_THRESHOLD = 256

export async function precompressDirectory(targetDir) {
  const entries = await readdir(targetDir, { withFileTypes: true, recursive: true })
  let count = 0
  let savedBytes = 0

  for (const entry of entries) {
    if (!entry.isFile()) continue

    const ext = path.extname(entry.name).toLowerCase()
    if (!COMPRESSIBLE_EXTENSIONS.has(ext)) continue

    const filePath = path.join(entry.parentPath ?? entry.path, entry.name)
    const fileStat = await stat(filePath)

    if (fileStat.size < MIN_SIZE_THRESHOLD) continue

    const content = await readFile(filePath)
    const compressed = gzipSync(content, { level: 9 })

    if (compressed.length >= content.length) continue

    const gzPath = `${filePath}.gz`
    await writeFile(gzPath, compressed)
    await utimes(gzPath, fileStat.atime, fileStat.mtime)

    count += 1
    savedBytes += content.length - compressed.length
  }

  return { count, savedBytes }
}

async function main() {
  const targetDir = path.resolve(process.argv[2] ?? 'out')
  const { count, savedBytes } = await precompressDirectory(targetDir)
  const savedKb = (savedBytes / 1024).toFixed(1)
  console.log(`📦 静态预压缩完成：生成 ${count} 个 .gz 文件，累计节省 ${savedKb} KB 体积。`)
}

if (process.argv[1] && process.argv[1].endsWith('precompress.mjs')) {
  main().catch((err) => {
    console.error('静态预压缩失败:', err)
    process.exit(1)
  })
}
