import { db } from '@/config/database';
import { races } from '@/schemas/races.schema';
import { selectUserSnapshot, users } from '@/schemas/users.schema';
import { desc, eq } from 'drizzle-orm';
import { RequestHandler } from 'express';

export const getLeaderboard: RequestHandler = async (req, res) => {
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

  res.json({ leaderboard });
};
