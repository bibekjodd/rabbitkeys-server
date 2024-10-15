import {
  createTrack,
  getTrackState,
  invitePlayer,
  kickPlayerFromTrack,
  leaveTrack,
  startRace,
  updateScore
} from '@/controllers/track.controller';
import { Router } from 'express';

const router = Router();
export const tracksRoute = router;

router.post('/', createTrack);
router.route('/:id').get(getTrackState);

router.put('/:id/leave', leaveTrack);
router.put('/:trackId/invite/:playerId', invitePlayer);
router.put('/:trackId/kick/:playerId', kickPlayerFromTrack);

router.put('/:id/start-race', startRace);
router.put('/:id/score', updateScore);
