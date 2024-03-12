import { createId } from '@paralleldrive/cuid2';
import { primaryKey, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable(
  'users',
  {
    id: text('id').notNull().$defaultFn(createId),
    name: text('name', { length: 50 }).notNull(),
    email: text('email', { length: 50 }).notNull(),
    image: text('image'),
    carImage: text('car_image')
      .notNull()
      .default('https://i.postimg.cc/F1thctp0/car5.png'),
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
export const selectUserSnapshot = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  carImage: users.carImage,
  role: users.role,
  createdAt: users.createdAt,
  lastOnline: users.lastOnline
};
export type UserSnapshot = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  carImage: string | null;
  role: string;
  createdAt: string;
  lastOnline: string;
  speed: number;
};
