import { db } from '@/config/database';
import { pusher } from '@/config/pusher';
import {
  InvitePlayerResponse,
  LeftTrackResponse,
  RemovedFromTrackResponse,
  TrackDeletedResponse,
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
import {
  dismissInactiveTrack,
  filterInactivePlayers,
  joinTrack
} from '@/services/track.service';
import { eq } from 'drizzle-orm';

export const createTrack = handleAsync(async (req, res) => {
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
          lastSeen: new Date().toISOString()
        }
      ],
      paragraphId,
      nextParagraphId,
      isStarted: false,
      isFinished: false
    })
    .returning();

  return res.status(201).json({ track: createdTrack });
});

export const getTrackState = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;

  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException('Track does not exist!');

  await dismissInactiveTrack(track);

  const inactivePlayers = filterInactivePlayers(track);
  if (inactivePlayers.includes(req.user.email) && track.isStarted) {
    await pusher.trigger(trackId, events.removedFromTrack, {
      players: inactivePlayers
    } satisfies LeftTrackResponse);

    throw new BadRequestException(
      'You have been removed from track due to inactivity'
    );
  }

  joinTrack(track, {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    image: req.user.image,
    carImage: req.user.carImage,
    isFinished: false,
    lastSeen: new Date().toISOString()
  });

  if (inactivePlayers.length) {
    pusher.trigger(trackId, events.leftTrack, {
      players: inactivePlayers
    } satisfies LeftTrackResponse);
  }

  await db
    .update(tracks)
    .set({ players: track.players })
    .where(eq(tracks.id, trackId));

  return res.json({ track });
});

export const leaveTrack = handleAsync<{ id: string }>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  const trackId = req.params.id;

  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException("Track doesn't exist");

  // delete track if creator is leaving
  if (track.creator === req.user.id) {
    db.delete(tracks).where(eq(tracks.id, trackId)).execute();
    pusher.trigger(trackId, events.trackDeleted, {
      message: `${req.user.name} has deleted the track`
    } satisfies TrackDeletedResponse);
    return res.json({ message: 'Track deleted successfully' });
  }

  pusher.trigger(trackId, events.leftTrack, {
    players: [req.user.id]
  } satisfies LeftTrackResponse);
  // update players on track
  const updatedPlayers = track.players.filter(
    (player) => player.id !== req.user?.id
  );
  db.update(tracks)
    .set({ players: updatedPlayers })
    .where(eq(tracks.id, trackId))
    .execute();
  return res.json({ message: 'Left track successfully' });
});

export const invitePlayer = handleAsync<
  { trackId: string; playerId: string },
  unknown,
  unknown,
  { player: unknown }
>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const { trackId, playerId } = req.params;
  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException('Track does not exist!');

  const isJoinedTrack = track.players.find(
    (player) => player.id === req.user?.id
  );

  if (!isJoinedTrack) {
    throw new BadRequestException('Join the track first to invite player');
  }

  if (track.isStarted)
    throw new BadRequestException(
      "Can't invite player when the race has started"
    );

  if (track.players.length >= 5)
    throw new BadRequestException('There can be max 5 players on the track');

  pusher.trigger(playerId, events.invitePlayer, {
    message: `${req.user.name} has invited you to join the track`,
    trackId
  } satisfies InvitePlayerResponse);

  return res.json({ message: 'Player invited successfully' });
});

export const kickPlayerFromTrack = handleAsync<{
  trackId: string;
  playerId: string;
}>(async (req, res) => {
  if (!req.user) throw new UnauthorizedException();

  const { trackId, playerId } = req.params;
  const [track] = await db.select().from(tracks).where(eq(tracks.id, trackId));
  if (!track) throw new NotFoundException("Track doesn't exist");

  if (track.creator !== req.user.id)
    throw new ForbiddenException(
      'Only the creator of track can kick players from the track'
    );

  if (track.creator === playerId)
    throw new ForbiddenException(
      "Creator can't kick themselves from the track"
    );

  if (track.isStarted)
    throw new BadRequestException(
      "Can't perform this action while race is running"
    );

  track.players = track.players.filter((player) => player.id !== playerId);
  await db
    .update(tracks)
    .set({ players: track.players })
    .where(eq(tracks.id, trackId));

  pusher.trigger(trackId, events.removedFromTrack, {
    playerId,
    message: `You have been removed from track by ${req.user.name}`
  } satisfies RemovedFromTrackResponse);

  return res.json({ message: 'Player removed from track successfully' });
});
