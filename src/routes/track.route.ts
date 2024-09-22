import {
  createTrack,
  getTrackState,
  leaveTrack
} from '@/controllers/track.controller';
import { Router } from 'express';

const router = Router();
export const trackRoute = router;

router.post('/', createTrack);
router.route('/:id').get(getTrackState);
router.get('/:id/leave', leaveTrack);
