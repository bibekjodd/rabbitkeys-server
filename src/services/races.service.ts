import { db } from '@/config/database';
import { InsertRace, races } from '@/schemas/races.schema';
import { Track } from '@/schemas/tracks.schema';
import { users } from '@/schemas/users.schema';
import { eq, sql } from 'drizzle-orm';

export const updateRaceResultFromTrack = async (track: Track) => {
  const insertData: InsertRace[] = track.players.map((player) => ({
    userId: player.id,
    position: player.position,
    accuracy: player.accuracy,
    speed: player.speed,
    topSpeed: player.topSpeed,
    createdAt: new Date().toISOString(),
    isMultiplayer: 1
  }));

  for (const player of track.players) {
    db.update(users)
      .set({
        speed: sql`(${users.speed}*${users.totalRaces}+${player.speed})/(${users.totalRaces}+1)`,
        totalRaces: sql`${users.totalRaces}+1`,
        topSpeed: sql`case when 
        ${player.topSpeed} > ${users.topSpeed} then ${player.topSpeed}
        else ${users.topSpeed}
        end`
      })
      .where(eq(users.id, player.id))
      .execute();
  }

  return db.insert(races).values(insertData).execute();
};
