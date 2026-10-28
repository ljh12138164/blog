import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common'
import { desc, eq } from 'drizzle-orm'
import { OwnerGuard } from './auth'
import { DatabaseService } from './database/database.service'
import { notes } from './database/schema'

export function parseNote(body: unknown, partial = false) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new BadRequestException('无效的随笔')
  const input = body as Record<string, unknown>
  const result: { content?: string; hidden?: boolean } = {}
  if (!partial || 'content' in input) {
    if (
      typeof input.content !== 'string' ||
      !input.content.trim() ||
      input.content.length > 20000
    ) {
      throw new BadRequestException('请填写 1 到 20000 字的正文')
    }
    result.content = input.content.trim()
  }
  if ('hidden' in input) {
    if (typeof input.hidden !== 'boolean') throw new BadRequestException('无效的可见状态')
    result.hidden = input.hidden
  }
  if (!Object.keys(result).length) throw new BadRequestException('没有可保存的修改')
  return result
}

function pageOffset(value: string | undefined) {
  if (value === undefined) return 0
  if (!/^\d+$/.test(value) || Number(value) > 1000000)
    throw new BadRequestException('无效的分页参数')
  return Number(value)
}

@Controller('notes')
export class PublicNotesController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  @Get()
  async list(@Query('offset') offset?: string) {
    const rows = await this.database.db
      .select()
      .from(notes)
      .where(eq(notes.hidden, false))
      .orderBy(desc(notes.createdAt), desc(notes.id))
      .limit(21)
      .offset(pageOffset(offset))
    return { notes: rows.slice(0, 20), hasMore: rows.length > 20 }
  }
}

@Controller('admin/notes')
@UseGuards(OwnerGuard)
export class AdminNotesController {
  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {}

  @Get()
  async list(@Query('offset') offset?: string) {
    const rows = await this.database.db
      .select()
      .from(notes)
      .orderBy(desc(notes.createdAt), desc(notes.id))
      .limit(21)
      .offset(pageOffset(offset))
    return { notes: rows.slice(0, 20), hasMore: rows.length > 20 }
  }

  @Post()
  async create(@Body() body: unknown) {
    const input = parseNote(body)
    const [note] = await this.database.db
      .insert(notes)
      .values({ content: input.content as string, hidden: input.hidden ?? false })
      .returning()
    return note
  }

  @Patch(':id')
  async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() body: unknown) {
    const input = parseNote(body, true)
    const [note] = await this.database.db
      .update(notes)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(notes.id, id))
      .returning()
    if (!note) throw new NotFoundException('随笔不存在')
    return note
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', new ParseUUIDPipe()) id: string) {
    const [note] = await this.database.db
      .delete(notes)
      .where(eq(notes.id, id))
      .returning({ id: notes.id })
    if (!note) throw new NotFoundException('随笔不存在')
  }
}
