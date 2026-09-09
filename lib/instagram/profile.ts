import { prisma } from '../prisma.js';

export async function getProfileFromDb(userId: string) {
  return prisma.instagramAccount.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      instagramUserId: true,
      username: true,
      name: true,
      accountType: true,
      profilePictureUrl: true,
      createdAt: true,
      updatedAt: true,
      tokenExpiresAt: true,
    },
  });
}
