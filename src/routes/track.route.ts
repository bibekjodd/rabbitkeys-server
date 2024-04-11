import {
  createTrack,
  getTrackState,
  invitePlayer,
  kickPlayerFromTrack,
  leaveTrack
} from '@/controllers/track.controller';
import { Router } from 'express';

const router = Router();
export const trackRoute = router;

router.post('/track', createTrack);
router.route('/track/:id').get(getTrackState);
router.get('/leave-track/:id', leaveTrack);
router.get('/invite/:trackId/:playerId', invitePlayer);
router.get('/kick/:trackId/:playerId', kickPlayerFromTrack);
