import { eq, sql } from 'drizzle-orm';

import { db } from '../../db/client';
import { users, type User } from '../../db/schema/users';

// Profile fields a user can edit via PATCH /me: null clears a value, undefined
// (or absent) skips it. Values are explicitly undefined-able to line up with the
// Zod-inferred input under exactOptionalPropertyTypes.
export type ProfileUpdate = {
  [K in 'birthdate' | 'sex' | 'heightCm']?: User[K] | undefined;
};

// Case-insensitive lookup, matching the lower(email) unique index.
export async function findByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);
  return user;
}

export async function findById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user;
}

export async function create(data: { email: string; passwordHash: string }): Promise<User> {
  const [user] = await db.insert(users).values(data).returning();
  if (!user) {
    // INSERT ... RETURNING always yields a row; this guards an impossible state.
    throw new Error('User insert returned no row');
  }
  return user;
}

export async function updateProfile(id: string, profile: ProfileUpdate): Promise<User | undefined> {
  const [user] = await db
    .update(users)
    .set({ ...profile, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user;
}
