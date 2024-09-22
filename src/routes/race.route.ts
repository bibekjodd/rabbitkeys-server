import { startRace, updateScore } from '@/controllers/race.controller';
import { Router } from 'express';

const router = Router();
export const raceRoute = router;
router.route('/:id').get(startRace).put(updateScore);
