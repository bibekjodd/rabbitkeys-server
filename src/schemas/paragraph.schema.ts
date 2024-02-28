import { createId } from '@paralleldrive/cuid2';
import { primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const paragraphs = sqliteTable(
  'paragraphs',
  {
    id: text('id').notNull().$defaultFn(createId),
    content: text('content').notNull()
  },
  function constraints(paragraphs) {
    return {
      primaryKey: primaryKey({
        name: 'paragraphs_pkey',
        columns: [paragraphs.id]
      })
    };
  }
);
export type Paragraph = typeof paragraphs.$inferSelect;
