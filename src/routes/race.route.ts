import {
  startRace,
  updateRaceData,
  updateScore
} from '@/controllers/race.controller';
import { Router } from 'express';

const router = Router();
export const raceRoute = router;
router.route('/race/:id').get(startRace).put(updateScore);
router.put('/race', updateRaceData);
