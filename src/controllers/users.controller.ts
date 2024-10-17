import { db } from '@/config/database';
import { queryUsersSchema, updateProfileSchema } from '@/dtos/users.dto';
import { NotFoundException, UnauthorizedException } from '@/lib/exceptions';
import { ResponseUser, users } from '@/schemas/users.schema';
import { and, desc, eq, gt, like, lt, or } from 'drizzle-orm';
import { RequestHandler } from 'express';

export const getProfile: RequestHandler<unknown, { user: ResponseUser }> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  res.json({ user: req.user });
};

export const getUserDetails: RequestHandler<{ id: string }, { user: ResponseUser }> = async (
  req,
  res
) => {
  const userId = req.params.id;
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new NotFoundException('User not found');
  res.json({ user });
};

export const updateProfile: RequestHandler<unknown, { user: ResponseUser }> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const data = updateProfileSchema.parse(req.body);
  const [user] = await db.update(users).set(data).where(eq(users.id, req.user.id)).returning();
  if (!user) throw new UnauthorizedException();
  res.json({ user: user! });
};

export const queryUsers: RequestHandler<unknown, { users: ResponseUser[] }> = async (req, res) => {
  const { limit, active, cursor, q } = queryUsersSchema.parse(req.query);
  const thirtySecondsBefore = new Date(Date.now() - 30 * 1000).toISOString();
  const result = await db
    .select()
    .from(users)
    .where(
      and(
        q ? or(like(users.name, `%${q}%`), like(users.email, `%${q}%`)) : undefined,
        cursor ? lt(users.id, cursor) : undefined,
        active ? gt(users.lastOnline, thirtySecondsBefore) : undefined
      )
    )
    .limit(limit)
    .orderBy((t) => desc(t.id));

  res.json({ users: result });
};
