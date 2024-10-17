import { db } from '@/config/database';
import { updateScoreSchema } from '@/dtos/races.dto';
import {
  onInvitePlayer,
  onLeftTrack,
  onRaceFinished,
  onRaceStarted,
  onRemovedFromTrack,
  onTrackDeleted,
  onUpdateScore
} from '@/lib/events';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerException,
  NotFoundException,
  UnauthorizedException
} from '@/lib/exceptions';
import { ResponseTrack, tracks } from '@/schemas/tracks.schema';
import { generateParagraph } from '@/services/paragraphs.services';
import { updateRaceResultFromTrack } from '@/services/races.service';
import { dismissInactiveTrack, filterInactivePlayers, joinTrack } from '@/services/tracks.service';
import { eq } from 'drizzle-orm';
import { RequestHandler } from 'express';

export const createTrack: RequestHandler<unknown, { track: ResponseTrack }> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const { id: paragraphId } = await generateParagraph();
  const { id: nextParagraphId } = await generateParagraph(paragraphId);
  const [createdTrack] = await db
    .insert(tracks)
    .values({
      creator: req.user.id,
      players: [
        {
          id: req.user.id,
          name: req.user.name,
          carImage: req.user.carImage,
          email: req.user.email,
          image: req.user.image,
          isFinished: false,
          lastSeen: new Date().toISOString(),
          accuracy: 100,
          duration: 0,
          position: 1,
          speed: 0,
          topSpeed: 0
        }
      ],
      paragraphId,
      nextParagraphId,
      isStarted: false,
      isFinished: false
    })
    .returning();

  if (!createdTrack) throw new InternalServerException();
  res.status(201).json({ track: createdTrack });
};

export const getTrackState: RequestHandler<{ id: string }, { track: ResponseTrack }> = async (
  req,
  res
) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;

  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException('Track does not exist!');

  await dismissInactiveTrack(track);

  const inactivePlayers = filterInactivePlayers(track);
  if (inactivePlayers.includes(req.user.email) && track.isStarted) {
    onLeftTrack(trackId, { players: inactivePlayers });

    throw new BadRequestException('You have been removed from track due to inactivity');
  }

  joinTrack(track, {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    image: req.user.image,
    carImage: req.user.carImage,
    isFinished: false,
    lastSeen: new Date().toISOString(),
    accuracy: 100,
    duration: 0,
    position: 1,
    speed: 0,
    topSpeed: 0
  });

  if (inactivePlayers.length) {
    onLeftTrack(trackId, { players: inactivePlayers });
  }

  await db.update(tracks).set({ players: track.players }).where(eq(tracks.id, trackId));

  res.json({ track });
};

export const leaveTrack: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;

  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException("Track doesn't exist");

  // delete track if creator is leaving
  if (track.creator === req.user.id) {
    db.delete(tracks).where(eq(tracks.id, trackId)).execute();
    onTrackDeleted(trackId, {
      message: `${req.user.name} has deleted the track`
    });
    res.json({ message: 'Track deleted successfully' });
    return;
  }

  onLeftTrack(trackId, { players: [req.user.id] });
  const updatedPlayers = track.players.filter((player) => player.id !== req.user?.id);
  db.update(tracks).set({ players: updatedPlayers }).where(eq(tracks.id, trackId)).execute();
  res.json({ message: 'Left track successfully' });
};

export const invitePlayer: RequestHandler<
  { trackId: string; playerId: string },
  unknown,
  unknown,
  { player: unknown }
> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const { trackId, playerId } = req.params;
  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException('Track does not exist!');

  const isJoinedTrack = track.players.find((player) => player.id === req.user?.id);

  if (!isJoinedTrack) {
    throw new BadRequestException('Join the track first to invite player');
  }

  if (track.isStarted)
    throw new BadRequestException("Can't invite player when the race has started");

  if (track.players.length >= 5)
    throw new BadRequestException('There can be max 5 players on the track');

  onInvitePlayer(playerId, {
    message: `${req.user.name} has invited you to join the track`,
    trackId
  });

  res.json({ message: 'Player invited successfully' });
};

export const kickPlayerFromTrack: RequestHandler<{
  trackId: string;
  playerId: string;
}> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const { trackId, playerId } = req.params;
  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException("Track doesn't exist");

  if (track.creator !== req.user.id)
    throw new ForbiddenException('Only the creator of track can kick players from the track');

  if (track.creator === playerId)
    throw new ForbiddenException("Creator can't kick themselves from the track");

  if (track.isStarted)
    throw new BadRequestException("Can't perform this action while race is running");

  track.players = track.players.filter((player) => player.id !== playerId);
  await db.update(tracks).set({ players: track.players }).where(eq(tracks.id, trackId));

  onRemovedFromTrack(trackId, {
    playerId,
    message: `You have been removed from track by ${req.user.name}`
  });

  res.json({ message: 'Player removed from track successfully' });
};

export const startRace: RequestHandler<{ id: string }, { track: ResponseTrack }> = async (
  req,
  res
) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;

  let [track] = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);

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
    lastSeen: new Date().toISOString(),
    accuracy: 100,
    duration: 0,
    position: 1,
    speed: 0,
    topSpeed: 0
  });

  if (track.players.length < 2)
    throw new BadRequestException('At least 2 players are required to start multiplayer race!');

  track.players = track.players.map((player) => ({
    ...player,
    isFinished: false,
    position: 1,
    speed: 0,
    duration: 0
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
  if (!track) throw new InternalServerException();

  onRaceStarted(trackId, { track });
  res.json({ track: track! });
};

export const updateScore: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;
  const { speed, progress, duration, accuracy, topSpeed } = updateScoreSchema.parse(req.body);

  onUpdateScore(trackId, {
    playerId: req.user.id,
    progress,
    speed,
    accuracy,
    topSpeed
  });

  if (progress !== 100) {
    res.json({ message: 'Score updated successfully!' });
    return;
  }

  let [track] = await db.select().from(tracks).where(eq(tracks.id, trackId)).limit(1);

  if (!track) {
    throw new NotFoundException('Track does not exist or has been dismissed');
  }
  if (!track.isStarted || track.isFinished) {
    throw new ForbiddenException('Scores can only be updated when the race has started');
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
  if (!track) throw new InternalServerException();

  if (isRaceFinished) {
    onRaceFinished(trackId, { track });
    updateRaceResultFromTrack(track);
  }

  res.json({ message: 'Score updated successfully' });
};
