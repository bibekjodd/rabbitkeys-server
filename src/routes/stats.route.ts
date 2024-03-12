import {
  getLeaderboard,
  getPreviousResults
} from '@/controllers/stats.controller';
import { Router } from 'express';

const router = Router();
export const statsRoute = router;

router.get('/results', getPreviousResults);
router.get('/leaderboard', getLeaderboard);
