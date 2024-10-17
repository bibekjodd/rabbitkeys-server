import { pusher } from '@/config/pusher';
import { PlayerState, Track } from '@/schemas/tracks.schema';

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
  player: PlayerState;
};
export const onJoinedTrack = (trackId: string, data: JoinedTrackResponse) => {
  return pusher.trigger(trackId, events.joinedTrack, data);
};

export type LeftTrackResponse = {
  players: string[];
};
export const onLeftTrack = (trackId: string, data: LeftTrackResponse) => {
  return pusher.trigger(trackId, events.leftTrack, data);
};

export type RaceStartedResponse = { track: Track };
export const onRaceStarted = (trackId: string, data: RaceStartedResponse) => {
  return pusher.trigger(trackId, events.raceStarted, data);
};

export type RaceFinishedResponse = { track: Track };
export const onRaceFinished = (trackId: string, data: RaceFinishedResponse) => {
  return pusher.trigger(trackId, events.raceFinished, data);
};

export type RemovedFromTrackResponse = { message: string; playerId: string };
export const onRemovedFromTrack = (trackId: string, data: RemovedFromTrackResponse) => {
  return pusher.trigger(trackId, events.removedFromTrack, data);
};

export type TrackDeletedResponse = {
  message: string;
};
export const onTrackDeleted = (trackId: string, data: TrackDeletedResponse) => {
  return pusher.trigger(trackId, events.trackDeleted, data);
};

export type UpdateScoreResponse = {
  playerId: string;
  speed: number;
  progress: number;
  accuracy: number;
  topSpeed: number;
};
export const onUpdateScore = (trackId: string, data: UpdateScoreResponse) => {
  return pusher.trigger(trackId, events.updateScore, data);
};

export type TrackDismissedResponse = {
  message: string;
};
export const onTrackDismissed = (trackId: string, data: TrackDismissedResponse) => {
  return pusher.trigger(trackId, events.trackDismissed, data);
};

export type InvitePlayerResponse = {
  trackId: string;
  message: string;
};
export const onInvitePlayer = (playerId: string, data: InvitePlayerResponse) => {
  return pusher.trigger(playerId, events.invitePlayer, data);
};
