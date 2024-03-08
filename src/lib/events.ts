export const events = {
  joinedTrack: 'joined-track',
  leftTrack: 'left-track',
  raceStarted: 'race-started',
  raceFinished: 'race-finished',
  removedFromTrack: 'removed-from-track',
  trackDeleted: 'track-deleted',
  updateScore: 'update-score',
  trackDismissed: 'track-dismissed'
};

export type JoinedTrackResponse = {
  player: { id: string; name: string; email: string; image: string | null };
};

export type LeftTrackResponse = {
  players: string[];
};

export type RaceStartedResponse = unknown;

export type RaceFinishedResponse = unknown;

export type TrackDeletedResponse = {
  message: string;
};

export type UpdateScoreResponse = {
  playerId: string;
  speed: number;
  progress: number;
};

export type TrackDismissedResponse = {
  message: string;
};
