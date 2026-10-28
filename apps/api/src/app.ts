import 'reflect-metadata'
import { Controller, Get, Inject, Module, ServiceUnavailableException } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { ThrottlerModule } from '@nestjs/throttler'
import type { NextFunction, Request, Response } from 'express'
import { AuthController, AuthService, OwnerGuard } from './auth'
import { API_CONFIG, type ApiConfig } from './config'
import { DatabaseService } from './database/database.service'
import { AdminNotesController, PublicNotesController } from './notes'

@Controller()
class HealthController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}
  @Get('healthz')
  live() {
    return { status: 'ok' }
  }
  @Get('readyz')
  async ready() {
    try {
      await this.database.ready()
    } catch {
      throw new ServiceUnavailableException('Database unavailable')
    }
    return { status: 'ok' }
  }
}

export async function createApp(config: ApiConfig) {
  @Module({
    imports: [ThrottlerModule.forRoot([{ ttl: 60000, limit: 5 }])],
    controllers: [HealthController, AuthController, PublicNotesController, AdminNotesController],
    providers: [{ provide: API_CONFIG, useValue: config }, DatabaseService, AuthService, OwnerGuard]
  })
  class AppModule {}

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn'] })
  app.setGlobalPrefix('api')
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (
      !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
      req.headers['x-journal-request'] !== '1'
    ) {
      res.status(403).json({ message: '无效的请求来源' })
      return
    }
    next()
  })
  app.enableShutdownHooks()
  return app
}
