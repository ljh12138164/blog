import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const journalCredentials = pgTable('journal_credentials', {
  id: text('id').primaryKey(),
  passwordHash: text('password_hash').notNull()
})

export const notes = pgTable(
  'notes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    content: text('content').notNull(),
    hidden: boolean('hidden').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [index('notes_created_at_idx').on(table.createdAt, table.id)]
)
