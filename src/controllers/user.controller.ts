import { db } from '@/config/database';
import { NotFoundException, UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { users } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';

export const getProfile = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  return res.json({ user: req.user });
});

export const getUserDetails = handleAsync<{ id: string }>(async (req, res) => {
  const userId = req.params.id;
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) throw new NotFoundException('User not found');
  return res.json({ user });
});
