import { db } from '@/config/database';
import { races } from '@/schemas/race.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { avg, eq } from 'drizzle-orm';
import passport from 'passport';

export const serializer = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser(async (id: string, done) => {
    try {
      const selectSpeed = db
        .select({ speed: races.speed })
        .from(races)
        .where(eq(races.userId, id))
        .orderBy(races.createdAt);
      const [user] = await db
        .select({ ...selectUserSnapshot, speed: avg(selectSpeed) })
        .from(users)
        .where(eq(users.id, id));

      if (!user) return done(null, null);
      done(null, { ...user, speed: Number(user.speed) || 0 });
      db.update(users)
        .set({ lastOnline: new Date().toISOString() })
        .where(eq(users.id, user.id))
        .execute();
    } catch (error) {
      done(error, null);
    }
  });
};
