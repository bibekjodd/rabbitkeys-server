import { db } from '@/config/database';
import { postRaceResultSchema } from '@/dtos/races.dto';
import { getPreviousResultsSchema } from '@/dtos/results.dto';
import { UnauthorizedException } from '@/lib/exceptions';
import { races, ResponseRace } from '@/schemas/races.schema';
import { users } from '@/schemas/users.schema';
import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { RequestHandler } from 'express';

export const updateRaceResult: RequestHandler<
  unknown,
  { result: ResponseRace },
  { speed: unknown; topSpeed: unknown }
> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const { speed, topSpeed, accuracy } = postRaceResultSchema.parse(req.body);
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
  res.status(201).json({ result: result! });
};

export const getPreviousResults: RequestHandler<unknown, { results: ResponseRace[] }> = async (
  req,
  res
) => {
  if (!req.user) throw new UnauthorizedException();
  const { cursor, limit } = getPreviousResultsSchema.parse(req.query);

  const results = await db
    .select()
    .from(races)
    .where(and(eq(races.userId, req.user.id), lt(races.createdAt, cursor)))
    .orderBy(desc(races.createdAt))
    .limit(limit);

  res.json({ results });
};
