import {
  getProfile,
  getUserDetails,
  updateProfile
} from '@/controllers/user.controller';
import { Router } from 'express';

const router = Router();
export const userRoute = router;

router.route('/profile').get(getProfile).put(updateProfile);
router.get('/:id', getUserDetails);
