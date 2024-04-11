import { db } from '@/config/database';
import { updateRaceResultSchema } from '@/dtos/race.dto';
import { getPreviousResultsSchema } from '@/dtos/result.dto';
import { UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { races } from '@/schemas/race.schema';
import { users } from '@/schemas/user.schema';
import { and, desc, eq, lt, sql } from 'drizzle-orm';

export const updateRaceResult = handleAsync<
  unknown,
  unknown,
  { speed: unknown; topSpeed: unknown }
>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const { speed, topSpeed, accuracy } = updateRaceResultSchema.parse(req.body);
  const [result] = await db
    .insert(races)
    .values({
      userId: req.user.id,
      isMultiplayer: 0,
      createdAt: new Date().toISOString(),
      position: 1,
      speed,
      topSpeed,
      accuracy
    })
    .returning();

  db.update(users)
    .set({
      speed: sql`(${users.speed}*${users.totalRaces}+${speed})/(${users.totalRaces}+1)`,
      totalRaces: sql`${users.totalRaces}+1`,
      topSpeed: sql`case when
        ${topSpeed} > ${users.topSpeed} then ${topSpeed}
        else ${users.topSpeed}
        end`
    })
    .where(eq(users.id, req.user.id))
    .execute();
  return res
    .status(201)
    .json({ result, message: 'Result updated successfully' });
});

export const getPreviousResults = handleAsync(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const { cursor, limit } = getPreviousResultsSchema.parse(req.query);

  const results = await db
    .select({
      id: races.id,
      userId: races.userId,
      position: races.position,
      speed: races.speed,
      topSpeed: races.topSpeed,
      accuracy: races.accuracy,
      isMultiplayer: races.isMultiplayer,
      createdAt: races.createdAt
    })
    .from(races)
    .where(and(eq(races.userId, req.user.id), lt(races.createdAt, cursor)))
    .orderBy(desc(races.createdAt))
    .groupBy(races.id)
    .limit(limit);

  return res.json({ results });
});
