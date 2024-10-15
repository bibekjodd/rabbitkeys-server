import {
  getPreviousResults,
  updateRaceResult
} from '@/controllers/result.controller';
import { Router } from 'express';

const router = Router();
export const resultsRoute = router;

router.route('/').post(updateRaceResult).get(getPreviousResults);
