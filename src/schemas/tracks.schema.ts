import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';

export type PlayerState = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  carImage: string | null;
  isFinished: boolean;
  lastSeen: string;
  speed?: number;
  duration?: number;
  position?: number;
};

export const tracks = sqliteTable(
  'tracks',
  {
    id: text('id')
      .notNull()
      .$defaultFn(() => createId()),
    creator: text('creator').notNull(),
    players: text('players', { mode: 'json' }).notNull().$type<PlayerState[]>(),
    paragraphId: text('paragraph_id').notNull(),
    nextParagraphId: text('next_paragraph_id').notNull(),
    isStarted: integer('is_started', { mode: 'boolean' }).notNull(),
    isFinished: integer('is_finished', { mode: 'boolean' }).notNull(),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    startedAt: text('started_at'),
    finishedAt: text('finished_at')
  },
  function constraints(tracks) {
    return {
      primaryKey: primaryKey({ name: 'tracks_pkey', columns: [tracks.id] }),
      userReference: foreignKey({
        name: 'fk_creator',
        columns: [tracks.creator],
        foreignColumns: [users.id]
      })
        .onDelete('cascade')
        .onUpdate('cascade')
    };
  }
);
export type Track = typeof tracks.$inferSelect;
