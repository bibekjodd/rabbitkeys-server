import { db } from '@/config/database';
import { env } from '@/config/env.config';
import { selectRandomCarImage } from '@/lib/images';
import { races } from '@/schemas/race.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { avg, eq } from 'drizzle-orm';
import { Strategy } from 'passport-google-oauth20';

export const GoogleStrategy = new Strategy(
  {
    clientID: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    passReqToCallback: true,
    callbackURL: env.GOOGLE_CALLBACK_URL
  },
  async (req, accessToken, refreshToken, profile, done) => {
    try {
      const name: string = profile.displayName;
      const email: string = profile.emails?.at(0)?.value || '';
      const image: string | null = profile.photos?.at(0)?.value || null;

      const [createdUser] = await db
        .insert(users)
        .values({ name, email, image, carImage: selectRandomCarImage() })
        .onConflictDoUpdate({
          target: [users.email],
          set: {
            lastOnline: new Date().toISOString()
          }
        })
        .returning({ id: users.id });

      if (!createdUser) return done(null, undefined);

      const selectSpeed = db
        .select({ speed: races.speed })
        .from(races)
        .where(eq(races.userId, createdUser.id))
        .orderBy(races.createdAt);

      const [user] = await db
        .select({ ...selectUserSnapshot, speed: avg(selectSpeed) })
        .from(users)
        .where(eq(users.id, createdUser.id));
      if (!user) return done(null, undefined);

      return done(null, { ...user, speed: Number(user.speed) || 0 });
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);
