import { getPreviousResults, updateRaceResult } from '@/controllers/results.controller';
import { Router } from 'express';

const router = Router();
export const resultsRoute = router;

router.route('/').post(updateRaceResult).get(getPreviousResults);
