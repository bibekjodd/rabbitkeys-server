import { Track } from '@/schemas/tracks.schema';

export const events = {
  joinedTrack: 'joined-track',
  leftTrack: 'left-track',
  raceStarted: 'race-started',
  raceFinished: 'race-finished',
  removedFromTrack: 'removed-from-track',
  trackDeleted: 'track-deleted',
  updateScore: 'update-score',
  trackDismissed: 'track-dismissed',
  invitePlayer: 'invite-player'
};

export type JoinedTrackResponse = {
  player: { id: string; name: string; email: string; image: string | null };
};

export type LeftTrackResponse = {
  players: string[];
};

export type RaceStartedResponse = unknown;

export type RaceFinishedResponse = { track: Track };

export type RemovedFromTrackResponse = { message: string; playerId: string };

export type TrackDeletedResponse = {
  message: string;
};

export type UpdateScoreResponse = {
  playerId: string;
  speed: number;
  progress: number;
  accuracy: number;
  topSpeed: number;
};

export type TrackDismissedResponse = {
  message: string;
};

export type InvitePlayerResponse = {
  trackId: string;
  message: string;
};
