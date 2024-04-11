import { db } from '@/config/database';
import { users } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';
import passport from 'passport';

export const serializer = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, id));
      if (user) {
        db.update(users)
          .set({ lastOnline: new Date().toISOString() })
          .where(eq(users.id, user.id))
          .execute();
      }
      return done(null, user || null);
    } catch (error) {
      return done(error, null);
    }
  });
};
