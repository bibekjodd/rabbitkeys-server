import { db } from '@/config/database';
import { handleAsync } from '@/middlewares/handle-async';
import { races } from '@/schemas/race.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { desc, eq } from 'drizzle-orm';

export const getLeaderboard = handleAsync(async (req, res) => {
  const leaderboard = await db
    .select({
      speed: races.speed,
      createdAt: races.createdAt,
      topSpeed: races.topSpeed,
      accuracy: races.accuracy,
      user: selectUserSnapshot
    })
    .from(races)
    .innerJoin(users, eq(races.userId, users.id))
    .groupBy(races.userId, races.createdAt)
    .orderBy(desc(races.speed))
    .limit(20);

  return res.json({ leaderboard });
});
