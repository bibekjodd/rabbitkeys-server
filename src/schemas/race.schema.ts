import {
  foreignKey,
  integer,
  sqliteTable,
  text
} from 'drizzle-orm/sqlite-core';
import { users } from './user.schema';

export const races = sqliteTable(
  'races',
  {
    userId: text('user_id').notNull(),
    position: integer('position').notNull(),
    speed: integer('speed').notNull(),
    createdAt: text('created_at').notNull(),
    isMultiplayer: integer('is_multiplayer').notNull()
  },
  function constraints(races) {
    return {
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
