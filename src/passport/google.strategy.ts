import { db } from '@/config/database';
import { env } from '@/config/env.config';
import { selectRandomCarImage } from '@/lib/images';
import { users } from '@/schemas/user.schema';
import { eq } from 'drizzle-orm';
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
      let [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user) {
        [user] = await db
          .insert(users)
          .values({ name, email, image, carImage: selectRandomCarImage() })
          .returning();
      }
      done(null, user);
    } catch (err) {
      done(err as Error, undefined);
    }
  }
);
