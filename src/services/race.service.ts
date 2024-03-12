import { db } from '@/config/database';
import { InsertRace, races } from '@/schemas/race.schema';
import { Track } from '@/schemas/tracks.schema';

export const updateRaceDataFromTrack = async (track: Track) => {
  const insertData: InsertRace[] = track.players.map((player) => ({
    userId: player.id,
    position: player.position!,
    speed: player.speed!,
    createdAt: new Date().toISOString(),
    isMultiplayer: 1
  }));
  return db.insert(races).values(insertData).execute();
};
