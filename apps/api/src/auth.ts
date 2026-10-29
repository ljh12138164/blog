import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import {
  type CanActivate,
  Controller,
  type ExecutionContext,
  Get,
  HttpCode,
  Inject,
  Injectable,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { ThrottlerGuard } from '@nestjs/throttler'
import { parse, serialize } from 'cookie'
import { eq } from 'drizzle-orm'
import type { Request, Response } from 'express'
import { API_CONFIG, type ApiConfig } from './config'
import { DatabaseService } from './database/database.service'
import { journalCredentials } from './database/schema'

const cookieName = 'journal_session'
const sessionSeconds = 7 * 24 * 60 * 60

@Injectable()
export class AuthService {
  constructor(
    @Inject(API_CONFIG) private readonly config: ApiConfig,
    @Inject(DatabaseService) private readonly database: DatabaseService
  ) {}

  async login(password: unknown, now = Date.now()) {
    if (typeof password !== 'string' || password.length > 1024) return undefined
    const credential = await this.credential()
    if (!credential || !(await Bun.password.verify(password, credential.passwordHash)))
      return undefined
    const payload = `${now + sessionSeconds * 1000}.${randomBytes(16).toString('hex')}`
    return `${payload}.${this.sign(payload, credential.passwordHash)}`
  }

  async isValid(token: string | undefined, now = Date.now()) {
    if (!token) return false
    const parts = token.split('.')
    if (parts.length !== 3 || !/^\d+$/.test(parts[0]) || !/^[a-f0-9]{32}$/.test(parts[1]))
      return false
    const expires = Number(parts[0])
    if (expires <= now || expires > now + sessionSeconds * 1000) return false
    const credential = await this.credential()
    if (!credential) return false
    const expected = Buffer.from(this.sign(`${parts[0]}.${parts[1]}`, credential.passwordHash))
    const supplied = Buffer.from(parts[2])
    return supplied.length === expected.length && timingSafeEqual(supplied, expected)
  }

  authenticated(req: Request) {
    return this.isValid(parse(req.headers.cookie ?? '')[cookieName])
  }

  cookie(value: string, maxAge = sessionSeconds) {
    return serialize(cookieName, value, {
      httpOnly: true,
      secure: this.config.secureCookie,
      sameSite: 'strict',
      path: '/api',
      maxAge
    })
  }

  private credential() {
    return this.database.db.query.journalCredentials.findFirst({
      where: eq(journalCredentials.id, 'owner')
    })
  }

  private sign(value: string, passwordHash: string) {
    return createHmac('sha256', this.config.sessionSecret)
      .update(`${value}.${passwordHash}`)
      .digest('hex')
  }
}

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    if (!(await this.auth.authenticated(context.switchToHttp().getRequest<Request>()))) {
      throw new UnauthorizedException('请先输入密码')
    }
    return true
  }
}

@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const session = await this.auth.login(req.body?.password)
    if (!session) {
      throw new UnauthorizedException('密码不正确')
    }
    res.setHeader('Set-Cookie', this.auth.cookie(session))
    return { authenticated: true }
  }

  @Get('session')
  @UseGuards(OwnerGuard)
  session() {
    return { authenticated: true }
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.setHeader('Set-Cookie', this.auth.cookie('', 0))
    return { authenticated: false }
  }
}
