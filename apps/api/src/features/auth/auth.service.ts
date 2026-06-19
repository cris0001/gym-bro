import type { User } from '../../db/schema/users';
import { signToken } from '../../lib/jwt';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../lib/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import * as authRepository from './auth.repository';
import type { ProfileUpdate } from './auth.repository';

// Public user shape returned by the API — never exposes passwordHash.
export type PublicUser = Omit<User, 'passwordHash'>;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export async function register(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  const normalizedEmail = email.toLowerCase();
  if (await authRepository.findByEmail(normalizedEmail)) {
    throw new ConflictError('Email already in use');
  }
  const passwordHash = await hashPassword(password);
  const user = await authRepository.create({
    email: normalizedEmail,
    passwordHash,
  });
  return { user: toPublicUser(user), token: await signToken(user.id) };
}

export async function login(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string }> {
  const user = await authRepository.findByEmail(email.toLowerCase());
  // Generic message either way — never reveal whether the email exists.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw new UnauthorizedError('Invalid email or password');
  }
  return { user: toPublicUser(user), token: await signToken(user.id) };
}

export async function getProfile(userId: string): Promise<PublicUser> {
  const user = await authRepository.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toPublicUser(user);
}

export async function updateProfile(userId: string, data: ProfileUpdate): Promise<PublicUser> {
  const user = await authRepository.updateProfile(userId, data);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toPublicUser(user);
}

export async function completeOnboarding(userId: string, data: ProfileUpdate): Promise<PublicUser> {
  const user = await authRepository.completeOnboarding(userId, data);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return toPublicUser(user);
}
