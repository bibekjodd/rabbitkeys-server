import { createId } from '@paralleldrive/cuid2';
import {
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';

export const paragraphs = sqliteTable(
  'paragraphs',
  {
    id: text('id').notNull().$defaultFn(createId),
    text: text('text').notNull(),
    wordsLength: integer('words_length').notNull(),
    charactersLength: integer('characters_length').notNull()
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
