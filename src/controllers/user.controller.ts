import { db } from '@/config/database';
import { updateProfileSchema } from '@/dtos/user.dto';
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

export const logoutUser = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  req.logout(() => {
    res.json({ message: 'User logged out successfully!' });
  });
});

export const updateProfile = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const data = updateProfileSchema.parse(req.body);
  const [user] = await db
    .update(users)
    .set(data)
    .where(eq(users.id, req.user.id))
    .returning();
  return res.json({ user: user || null });
});

export const deleteProfile = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  db.delete(users).where(eq(users.id, req.user.id)).execute();
  req.logout(() => {
    res.json({ message: 'Account deleted successfully' });
  });
});
