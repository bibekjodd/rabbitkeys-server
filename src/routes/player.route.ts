import {
  getActivePlayers,
  invitePlayer,
  kickPlayerFromTrack
} from '@/controllers/player.controller';
import { Router } from 'express';

const router = Router();
export const playerRoute = router;
router.get('/active', getActivePlayers);
router.get('/:playerId/invite/:trackId', invitePlayer);
router.get('/:playerId/kick/:trackId', kickPlayerFromTrack);
