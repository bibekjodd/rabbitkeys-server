import { env } from '@/config/env.config';
import {
  getProfile,
  getUserDetails,
  logoutUser,
  searchActivePlayers,
  updateProfile
} from '@/controllers/user.controller';
import { Router } from 'express';
import passport from 'passport';

const router = Router();
export const userRoute = router;

router.get(
  '/login/google',
  passport.authenticate('google', { scope: ['email', 'profile'] })
);

router.get('/callback/google', passport.authenticate('google'), (req, res) => {
  return res.redirect(env.AUTH_REDIRECT_URI);
});

router.route('/profile').get(getProfile).put(updateProfile);
router.get('/user/:id', getUserDetails);
router.get('/logout', logoutUser);
router.get('/active-players', searchActivePlayers);
