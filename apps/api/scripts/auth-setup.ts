import { savePasswordHash } from '../src/database/credentials'

async function setup() {
  const url = process.env.DATABASE_URL
  if (!url)
    throw new Error('DATABASE_URL is required; configure .env and run pnpm db:migrate first')
  const password = prompt('设置随笔写作密码（至少 10 位）：')
  if (!password || password.length < 10 || password.length > 1024) {
    throw new Error('密码长度须为 10 到 1024 位')
  }
  await savePasswordHash(url, await Bun.password.hash(password, { algorithm: 'argon2id' }))
  console.log('写作密码已保存到数据库，旧会话已失效，无需重启 API。')
}

setup().catch(() => {
  console.error('Password update failed; check DATABASE_URL, migrations and password length')
  process.exitCode = 1
})
