import { createId } from '@paralleldrive/cuid2';
import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const paragraphs = sqliteTable('paragraphs', {
  id: text('id').notNull().primaryKey().$defaultFn(createId),
  content: text('content').notNull()
});
export type Paragraph = typeof paragraphs.$inferSelect;
