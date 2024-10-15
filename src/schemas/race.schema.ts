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

export const races = sqliteTable(
  'races',
  {
    id: text('id').notNull().$defaultFn(createId),
    userId: text('user_id').notNull(),
    position: integer('position').notNull(),
    accuracy: integer('accuracy').notNull().default(0),
    speed: integer('speed').notNull().default(0),
    topSpeed: integer('top_speed').notNull().default(0),
    createdAt: text('created_at').notNull(),
    isMultiplayer: integer('is_multiplayer').notNull()
  },
  function constraints(races) {
    return {
      primaryKey: primaryKey({ name: 'races_pkey', columns: [races.id] }),
      userReference: foreignKey(() => ({
        name: 'fk_user_id',
        columns: [races.userId],
        foreignColumns: [users.id]
      }))
        .onDelete('cascade')
        .onUpdate('cascade')
    };
  }
);

export type Race = typeof races.$inferSelect;
export type InsertRace = typeof races.$inferInsert;
export const selectRaceSchema = createSelectSchema(races);
export const responseRaceSchema = selectRaceSchema;
export type ResponseRace = z.infer<typeof responseRaceSchema>;
