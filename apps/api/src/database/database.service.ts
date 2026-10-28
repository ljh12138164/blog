import { Inject, Injectable, type OnModuleDestroy } from '@nestjs/common'
import { sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { API_CONFIG, type ApiConfig } from '../config'
import * as schema from './schema'

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly client
  readonly db

  constructor(@Inject(API_CONFIG) config: ApiConfig) {
    this.client = postgres(config.databaseUrl, {
      max: 5,
      connect_timeout: 5,
      idle_timeout: 20,
      onnotice: () => {}
    })
    this.db = drizzle(this.client, { schema })
  }

  async ready() {
    await this.db.execute(sql`select 1`)
  }

  async onModuleDestroy() {
    await this.client.end({ timeout: 5 })
  }
}
