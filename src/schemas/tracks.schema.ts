import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  integer,
  primaryKey,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './user.schema';

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
export const playerStateSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  image: z.string().nullish(),
  carImage: z.string().nullish(),
  isFinished: z.boolean(),
  lastSeen: z.string(),
  postition: z.number().positive().nullish(),
  accuracy: z.number().positive().max(100).nullish(),
  speed: z.number().positive().max(500).nullish(),
  topSpeed: z.number().positive().max(500).nullish(),
  duration: z.number().positive().nullish()
});
export type PlayerState = z.infer<typeof playerStateSchema>;
export const selectTrackSchema = createSelectSchema(tracks);
export const responseTrackSchema = selectTrackSchema.extend({
  players: z.array(playerStateSchema)
});
export type ResponseTrack = z.infer<typeof responseTrackSchema>;
