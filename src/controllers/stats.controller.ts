import { db } from '@/config/database';
import { getPreviousResultsSchema } from '@/dtos/stats.dto';
import { UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { races } from '@/schemas/race.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { and, avg, desc, eq, lt } from 'drizzle-orm';

export const getPreviousResults = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const { cursor, limit } = getPreviousResultsSchema.parse(req.query);
  const results = await db
    .select()
    .from(races)
    .where(and(eq(races.userId, req.user.id), lt(races.createdAt, cursor)))
    .orderBy(desc(races.createdAt))
    .limit(limit);

  return res.json({ results });
});

export const getLeaderboard = handleAsync(async (req, res) => {
  const selectSpeed = db
    .select({ speed: races.speed })
    .from(races)
    .where(eq(races.userId, users.id));
  const leaderboard = await db
    .select({
      speed: races.speed,
      createdAt: races.createdAt,
      user: {
        ...selectUserSnapshot,
        speed: avg(selectSpeed)
      }
    })
    .from(races)
    .innerJoin(users, eq(races.userId, users.id))
    .groupBy(races.userId, races.createdAt)
    .orderBy(desc(races.speed))
    .limit(20);

  const result = leaderboard.map((data) => ({
    ...data,
    user: { ...data.user, speed: Number(data.user.speed) || 0 }
  }));

  return res.json({ leaderboard: result });
});
