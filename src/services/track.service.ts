import { db } from '@/config/database';
import { pusher } from '@/config/pusher';
import {
  JoinedTrackResponse,
  TrackDismissedResponse,
  events
} from '@/lib/events';
import { BadRequestException, ForbiddenException } from '@/lib/exceptions';
import { PlayerState, Track, tracks } from '@/schemas/tracks.schema';
import { eq } from 'drizzle-orm';

export const filterInactivePlayers = (track: Track) => {
  // allow max 100 seconds of inactivity to players
  const maxInactivityDuration = 100 * 1000;

  const inactivePlayers: string[] = [];
  for (const player of track.players) {
    const inactivityDuration = Date.now() - new Date(player.lastSeen).getTime();
    if (inactivityDuration > maxInactivityDuration)
      inactivePlayers.push(player.id);
  }

  track.players = track.players.filter((player) => {
    const inactivityDuration = Date.now() - new Date(player.lastSeen).getTime();
    return inactivityDuration <= maxInactivityDuration;
  });

  return inactivePlayers;
};

export const joinTrack = (track: Track, player: PlayerState) => {
  const isJoinedTrack = track.players.find(({ id }) => id === player.id);

  if (isJoinedTrack) {
    track.players = track.players.map((currentPlayer) => {
      if (currentPlayer.id !== player.id) return currentPlayer;
      return {
        ...currentPlayer,
        lastSeen: new Date().toISOString()
      };
    });
    return track;
  }

  if (track.isStarted) {
    throw new ForbiddenException(
      "Can't join track where the race has already begun."
    );
  }
  if (track.players.length === 5) {
    throw new ForbiddenException(
      '5 players are already on the track. Try creating or joining other track!'
    );
  }

  track.players.push(player);
  pusher.trigger(track.id, events.joinedTrack, {
    player: {
      id: player.id,
      name: player.name,
      email: player.email,
      image: player.image || null
    }
  } satisfies JoinedTrackResponse);

  return track;
};

export const dismissInactiveTrack = async (track: Track) => {
  // allow max 5 minutes inactivity for track
  const maxInactivityDuration = 5 * 60 * 1000;
  let message =
    'Track has been dismissed as players were inactive for a longer period';
  if (track.isStarted) {
    message =
      'Track has been dismissed as players were unable to finish the race within 5 minutes';
  }

  const currentTime = Date.now();
  let isActiveTrack = true;
  if (track.isStarted) {
    const inactivityDuration =
      new Date().getTime() - new Date(track.startedAt!).getTime();
    if (inactivityDuration > maxInactivityDuration) isActiveTrack = false;
  }
  if (!track.isStarted && !track.isFinished) {
    const inactivityDuration =
      currentTime - new Date(track.createdAt).getTime();
    if (inactivityDuration > maxInactivityDuration) isActiveTrack = false;
  }
  if (track.isFinished) {
    const inactivityDuration =
      currentTime - new Date(track.finishedAt!).getTime();
    if (inactivityDuration > maxInactivityDuration) isActiveTrack = false;
  }

  if (isActiveTrack) return;
  const trackDismissedResponse: TrackDismissedResponse = {
    message
  };
  const notifyOnTrackDismissed = pusher.trigger(
    track.id,
    events.trackDismissed,
    trackDismissedResponse
  );
  const deleteTrack = db.delete(tracks).where(eq(tracks.id, track.id));
  await Promise.all([deleteTrack, notifyOnTrackDismissed]);
  throw new BadRequestException('Track has been dismissed due to inactivity');
};
