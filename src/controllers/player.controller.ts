import { db } from '@/config/database';
import { pusher } from '@/config/pusher';
import {
  InvitePlayerResponse,
  RemovedFromTrackResponse,
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
import { users } from '@/schemas/user.schema';
import { and, eq, gt, like, ne, or } from 'drizzle-orm';

export const getActivePlayers = handleAsync<
  unknown,
  unknown,
  unknown,
  { q: string }
>(async (req, res) => {
  let query = req.query.q;
  if (!query || typeof query !== 'string') {
    query ||= '';
  }
  query = query.trim();
  const THIRTY_SECONDS = 30 * 1000;
  const inactivityTime = new Date(Date.now() - THIRTY_SECONDS).toISOString();
  const players = await db
    .select()
    .from(users)
    .where(
      and(
        gt(users.lastOnline, inactivityTime),
        or(like(users.name, `%${query}%`), like(users.email, `%${query}%`)),
        req.user ? ne(users.id, req.user.id) : undefined
      )
    )
    .limit(20);
  return res.json({ players });
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
