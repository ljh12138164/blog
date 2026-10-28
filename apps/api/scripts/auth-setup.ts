import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'

async function setup() {
  const path = resolve('.env')
  if (await Bun.file(path).exists()) {
    throw new Error('.env already exists; edit it explicitly to rotate credentials')
  }
  const password = prompt('设置随笔写作密码（至少 12 位）：')
  if (!password || password.length < 12 || password.length > 1024) {
    throw new Error('密码长度须为 12 到 1024 位')
  }
  const example = await Bun.file('.env.example').text()
  const config = example
    .replace('replace-with-argon2id-hash', await Bun.password.hash(password))
    .replace('replace-with-at-least-32-random-characters', randomBytes(32).toString('hex'))
  await Bun.write(path, config)
  console.log('已生成 apps/api/.env；请按需修改数据库地址。')
}

setup().catch((error: Error) => {
  console.error(error.message)
  process.exitCode = 1
})
