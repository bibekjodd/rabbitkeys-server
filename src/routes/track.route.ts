import {
  createTrack,
  getTrackState,
  leaveTrack
} from '@/controllers/track.controller';
import { Router } from 'express';

const router = Router();
export const trackRoute = router;

router.post('/track', createTrack);
router.route('/track/:id').get(getTrackState);
router.get('/leave-track/:id', leaveTrack);
