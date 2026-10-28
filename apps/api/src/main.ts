import { createApp } from './app'
import { readConfig } from './config'

async function bootstrap() {
  const config = readConfig()
  const app = await createApp(config)
  await app.listen(config.port, config.host)
  console.log(`Journal API listening on ${config.host}:${config.port}`)
}

bootstrap().catch(() => {
  console.error('API startup failed; check environment and port availability')
  process.exitCode = 1
})
