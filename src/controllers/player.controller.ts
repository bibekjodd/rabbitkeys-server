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
