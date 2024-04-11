import {
  getPreviousResults,
  updateRaceResult
} from '@/controllers/result.controller';
import { Router } from 'express';

const router = Router();
export const resultRoute = router;

router.post('/result', updateRaceResult);
router.get('/results', getPreviousResults);
