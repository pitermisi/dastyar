import crypto from 'crypto';
import type { Request, Response } from 'express';
import { getPrisma, isDatabaseConfigured } from './prisma.js';
import { encryptToken, decryptToken } from './crypto.js';
import type { InstagramApiUserResponse, InstagramProfileData } from '../types/instagram.js';

export const SESSION_COOKIE_NAME = 'ig_session_token';
export const OAUTH_STATE_COOKIE_NAME = 'ig_oauth_state';
const SESSION_DURATION_DAYS = 14;

// In-memory fallback stores when DATABASE_URL is not yet provided (e.g. during initial preview)
interface MemoryUser {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryInstagramAccount {
  id: string;
  userId: string;
  instagramUserId: string;
  username: string;
  name: string | null;
  accountType: string | null;
  profilePictureUrl: string | null;
  accessTokenEncryptedOrSecurelyStored: string;
  tokenExpiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MemorySession {
  id: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

const memoryUsers = new Map<string, MemoryUser>();
const memoryAccounts = new Map<string, MemoryInstagramAccount>();
const memorySessions = new Map<string, MemorySession>();

/**
 * Generates a cryptographically secure random state parameter for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Cookie options compatible with both standalone web and iframe environments
 */
export function getSessionCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: true, // Always true for HTTPS / preview iframe compatibility
    sameSite: 'none' as const, // Required for cross-origin iframe context
    path: '/',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
  };
}

/**
 * Creates or updates an Instagram account and user from Meta profile & access token.
 * Encrypts the access token before persisting to the database.
 */
export async function syncInstagramUser(
  profile: InstagramApiUserResponse,
  accessToken: string,
  expiresInSeconds?: number
): Promise<{ userId: string; profileData: InstagramProfileData }> {
  const encryptedToken = encryptToken(accessToken);
  const tokenExpiresAt = expiresInSeconds
    ? new Date(Date.now() + expiresInSeconds * 1000)
    : null;

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();

    // Check if an existing Instagram account exists with this Instagram User ID
    const existingAccount = await prisma.instagramAccount.findUnique({
      where: { instagramUserId: profile.id },
      include: { user: true },
    });

    let userId: string;

    if (existingAccount) {
      userId = existingAccount.userId;
      // Update existing Instagram account details and refreshed token
      const updated = await prisma.instagramAccount.update({
        where: { id: existingAccount.id },
        data: {
          username: profile.username,
          name: profile.name || null,
          accountType: profile.account_type || null,
          profilePictureUrl: profile.profile_picture_url || null,
          accessTokenEncryptedOrSecurelyStored: encryptedToken,
          tokenExpiresAt,
        },
      });

      return {
        userId,
        profileData: {
          id: updated.id,
          userId: updated.userId,
          instagramUserId: updated.instagramUserId,
          username: updated.username,
          name: updated.name,
          accountType: updated.accountType,
          profilePictureUrl: updated.profilePictureUrl,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      };
    }

    // New user registration
    const newUser = await prisma.user.create({
      data: {
        instagramAccount: {
          create: {
            instagramUserId: profile.id,
            username: profile.username,
            name: profile.name || null,
            accountType: profile.account_type || null,
            profilePictureUrl: profile.profile_picture_url || null,
            accessTokenEncryptedOrSecurelyStored: encryptedToken,
            tokenExpiresAt,
          },
        },
      },
      include: { instagramAccount: true },
    });

    const account = newUser.instagramAccount!;
    return {
      userId: newUser.id,
      profileData: {
        id: account.id,
        userId: account.userId,
        instagramUserId: account.instagramUserId,
        username: account.username,
        name: account.name,
        accountType: account.accountType,
        profilePictureUrl: account.profilePictureUrl,
        createdAt: account.createdAt.toISOString(),
        updatedAt: account.updatedAt.toISOString(),
      },
    };
  }

  // In-memory fallback when database is not yet provisioned
  let existingAccountId: string | null = null;
  for (const [id, acc] of memoryAccounts.entries()) {
    if (acc.instagramUserId === profile.id) {
      existingAccountId = id;
      break;
    }
  }

  const now = new Date();
  if (existingAccountId) {
    const acc = memoryAccounts.get(existingAccountId)!;
    acc.username = profile.username;
    acc.name = profile.name || null;
    acc.accountType = profile.account_type || null;
    acc.profilePictureUrl = profile.profile_picture_url || null;
    acc.accessTokenEncryptedOrSecurelyStored = encryptedToken;
    acc.tokenExpiresAt = tokenExpiresAt;
    acc.updatedAt = now;

    return {
      userId: acc.userId,
      profileData: {
        id: acc.id,
        userId: acc.userId,
        instagramUserId: acc.instagramUserId,
        username: acc.username,
        name: acc.name,
        accountType: acc.accountType,
        profilePictureUrl: acc.profilePictureUrl,
        createdAt: acc.createdAt.toISOString(),
        updatedAt: acc.updatedAt.toISOString(),
      },
    };
  }

  const userId = `usr_${crypto.randomBytes(12).toString('hex')}`;
  const accountId = `acc_${crypto.randomBytes(12).toString('hex')}`;

  const user: MemoryUser = { id: userId, createdAt: now, updatedAt: now };
  const account: MemoryInstagramAccount = {
    id: accountId,
    userId,
    instagramUserId: profile.id,
    username: profile.username,
    name: profile.name || null,
    accountType: profile.account_type || null,
    profilePictureUrl: profile.profile_picture_url || null,
    accessTokenEncryptedOrSecurelyStored: encryptedToken,
    tokenExpiresAt,
    createdAt: now,
    updatedAt: now,
  };

  memoryUsers.set(userId, user);
  memoryAccounts.set(accountId, account);

  return {
    userId,
    profileData: {
      id: account.id,
      userId: account.userId,
      instagramUserId: account.instagramUserId,
      username: account.username,
      name: account.name,
      accountType: account.accountType,
      profilePictureUrl: account.profilePictureUrl,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    },
  };
}

/**
 * Creates a server-side session for the given user ID.
 */
export async function createSession(userId: string): Promise<string> {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    await prisma.session.create({
      data: {
        id: sessionId,
        userId,
        expiresAt,
      },
    });
    return sessionId;
  }

  // Memory fallback
  memorySessions.set(sessionId, {
    id: sessionId,
    userId,
    expiresAt,
    createdAt: new Date(),
  });

  return sessionId;
}

/**
 * Validates a session token and retrieves user and profile data.
 */
export async function getSessionUser(sessionId?: string): Promise<{
  user: { id: string; createdAt: string };
  instagramAccount?: InstagramProfileData;
} | null> {
  if (!sessionId) return null;

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          include: { instagramAccount: true },
        },
      },
    });

    if (!session) return null;

    // Check expiration
    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      return null;
    }

    const acc = session.user.instagramAccount;
    return {
      user: {
        id: session.user.id,
        createdAt: session.user.createdAt.toISOString(),
      },
      instagramAccount: acc
        ? {
            id: acc.id,
            userId: acc.userId,
            instagramUserId: acc.instagramUserId,
            username: acc.username,
            name: acc.name,
            accountType: acc.accountType,
            profilePictureUrl: acc.profilePictureUrl,
            createdAt: acc.createdAt.toISOString(),
            updatedAt: acc.updatedAt.toISOString(),
          }
        : undefined,
    };
  }

  // Memory fallback
  const session = memorySessions.get(sessionId);
  if (!session) return null;

  if (new Date() > session.expiresAt) {
    memorySessions.delete(sessionId);
    return null;
  }

  const user = memoryUsers.get(session.userId);
  if (!user) return null;

  let account: MemoryInstagramAccount | undefined;
  for (const acc of memoryAccounts.values()) {
    if (acc.userId === user.id) {
      account = acc;
      break;
    }
  }

  return {
    user: {
      id: user.id,
      createdAt: user.createdAt.toISOString(),
    },
    instagramAccount: account
      ? {
          id: account.id,
          userId: account.userId,
          instagramUserId: account.instagramUserId,
          username: account.username,
          name: account.name,
          accountType: account.accountType,
          profilePictureUrl: account.profilePictureUrl,
          createdAt: account.createdAt.toISOString(),
          updatedAt: account.updatedAt.toISOString(),
        }
      : undefined,
  };
}

/**
 * Invalidates and deletes a session.
 */
export async function destroySession(sessionId?: string): Promise<void> {
  if (!sessionId) return;

  if (isDatabaseConfigured()) {
    const prisma = getPrisma();
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  } else {
    memorySessions.delete(sessionId);
  }
}
