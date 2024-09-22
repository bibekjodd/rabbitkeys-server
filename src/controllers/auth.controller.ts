import { UnauthorizedException } from '@/lib/exceptions';
import { handleAsync } from '@/middlewares/handle-async';

export const logoutUser = handleAsync((req, res) => {
  if (!req.user) throw new UnauthorizedException();
  req.logout(() => {
    res.json({ message: 'User logged out successfully!' });
  });
});
