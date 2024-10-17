import { UnauthorizedException } from '@/lib/exceptions';
import { RequestHandler } from 'express';

export const logoutUser: RequestHandler = (req, res) => {
  if (!req.user) throw new UnauthorizedException();
  req.logout(() => {
    res.json({ message: 'User logged out successfully!' });
  });
};
