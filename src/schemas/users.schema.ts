import { createId } from '@paralleldrive/cuid2';
import { getTableColumns } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';
import { createSelectSchema } from 'drizzle-zod';

export const users = sqliteTable(
  'users',
  {
    id: text('id').notNull().$defaultFn(createId),
    name: text('name', { length: 50 }).notNull(),
    email: text('email', { length: 50 }).notNull(),
    image: text('image'),
    totalRaces: integer('total_races').notNull().default(0),
    speed: integer('speed').notNull().default(0),
    topSpeed: integer('top_speed').notNull().default(0),
    carImage: text('car_image').notNull().default('https://i.postimg.cc/F1thctp0/car5.png'),
    role: text('role', { enum: ['user', 'admin'] })
      .notNull()
      .default('user'),
    createdAt: text('created_at')
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    lastOnline: text('last_online')
      .notNull()
      .$defaultFn(() => new Date().toISOString())
  },
  function constraints(users) {
    return {
      primaryKey: primaryKey({ name: 'users_pkey', columns: [users.id] }),
      uniqueEmail: unique('email').on(users.email)
    };
  }
);

export type User = typeof users.$inferSelect;
export const selectUserSnapshot = getTableColumns(users);
export const selectUserSchema = createSelectSchema(users);
export const responseUserSchema = selectUserSchema;
export type ResponseUser = User;
