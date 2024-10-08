import { db } from '@/config/database';
import { pusher } from '@/config/pusher';
import { updateScoreSchema } from '@/dtos/race.dto';
import {
  RaceFinishedResponse,
  RaceStartedResponse,
  UpdateScoreResponse,
  events
} from '@/lib/events';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException
} from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';
import { tracks } from '@/schemas/tracks.schema';
import { generateParagraph } from '@/services/paragraph.service';
import { updateRaceResultFromTrack } from '@/services/race.service';
import { dismissInactiveTrack, joinTrack } from '@/services/track.service';
import { eq } from 'drizzle-orm';

export const startRace = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;

  let [track] = await db
    .select()
    .from(tracks)
    .where(eq(tracks.id, trackId))
    .limit(1);

  if (!track) throw new NotFoundException();
  if (track.creator !== req.user.id)
    throw new ForbiddenException('Only creator can start the race');
  if (track.isStarted) throw new BadRequestException('Race has already begun!');
  await dismissInactiveTrack(track);
  track = joinTrack(track, {
    id: req.user.id,
    name: req.user.name!,
    email: req.user.email,
    image: req.user.image!,
    carImage: req.user.carImage,
    isFinished: false,
    lastSeen: new Date().toISOString()
  });

  if (track.players.length < 2)
    throw new BadRequestException(
      'At least 2 players are required to start multiplayer race!'
    );

  track.players = track.players.map((player) => ({
    ...player,
    isFinished: false,
    position: undefined,
    speed: undefined,
    duration: undefined
  }));

  [track] = await db
    .update(tracks)
    .set({
      players: track.players,
      isStarted: true,
      startedAt: new Date().toISOString(),
      isFinished: false,
      finishedAt: null
    })
    .where(eq(tracks.id, trackId))
    .returning();

  pusher.trigger(trackId, events.raceStarted, {} satisfies RaceStartedResponse);

  return res.json({ track });
});

export const updateScore = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;
  const { speed, progress, duration, accuracy, topSpeed } =
    updateScoreSchema.parse(req.body);

  pusher.trigger(trackId, events.updateScore, {
    playerId: req.user.id,
    progress,
    speed,
    accuracy,
    topSpeed
  } satisfies UpdateScoreResponse);

  if (progress !== 100)
    return res.json({ message: 'Score updated successfully!' });

  let [track] = await db
    .select()
    .from(tracks)
    .where(eq(tracks.id, trackId))
    .limit(1);

  if (!track) {
    throw new NotFoundException('Track does not exist or has been dismissed');
  }
  if (!track.isStarted || track.isFinished) {
    throw new ForbiddenException(
      'Scores can only be updated when the race has started'
    );
  }

  let position = 1;
  for (const player of track.players) {
    if (player.isFinished) position++;
  }
  track.players = track.players.map((player) => {
    if (req.user?.id !== player.id) return player;
    return {
      ...player,
      isFinished: true,
      lastSeen: new Date().toISOString(),
      speed,
      duration,
      position,
      topSpeed,
      accuracy
    };
  });

  const isRaceFinished = track.players.every((player) => player.isFinished);
  const finishedAt = isRaceFinished ? new Date().toISOString() : null;

  if (isRaceFinished) {
    track.players = track.players.map((player) => ({
      ...player,
      isFinished: isRaceFinished ? false : true
    }));
    track.paragraphId = track.nextParagraphId;
    const nextParagraph = await generateParagraph(track.paragraphId);
    track.nextParagraphId = nextParagraph.id;
  }

  [track] = await db
    .update(tracks)
    .set({
      isFinished: isRaceFinished,
      isStarted: !isRaceFinished,
      finishedAt,
      players: track.players,
      paragraphId: track.paragraphId,
      nextParagraphId: track.nextParagraphId
    })
    .where(eq(tracks.id, trackId))
    .returning();

  if (isRaceFinished) {
    pusher.trigger(trackId, events.raceFinished, {
      track: track!
    } satisfies RaceFinishedResponse);
    if (track) updateRaceResultFromTrack(track);
  }

  return res.json({ message: 'Score updated successfully' });
});
