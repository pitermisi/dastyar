import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

export const isDatabaseConfigured = (): boolean => {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '');
};

let prismaInstance: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!isDatabaseConfigured()) {
    throw new Error('DATABASE_URL is not set. Please configure your PostgreSQL connection string in .env');
  }

  if (!prismaInstance) {
    if (process.env.NODE_ENV === 'production') {
      prismaInstance = new PrismaClient();
    } else {
      if (!global.globalPrisma) {
        global.globalPrisma = new PrismaClient();
      }
      prismaInstance = global.globalPrisma;
    }
  }

  return prismaInstance;
}

export const prisma = {
  get client() {
    return getPrisma();
  },
};
