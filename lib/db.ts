import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { SystemSetting } from '@/app/models/system';

export async function isUnique<T extends keyof PrismaClient & string>(
  table: T,
  fields: Record<string, unknown>,
  exclude?: Record<string, unknown>,
): Promise<boolean> {
  if (!(table in prisma)) {
    throw new Error(`Table '${table}' does not exist in Prisma Client.`);
  }

  const whereClause: Record<string, unknown> = {
    OR: Object.entries(fields).map(([key, value]) => ({ [key]: value })),
  };

  if (exclude) {
    whereClause['NOT'] = Object.entries(exclude).map(([key, value]) => ({
      [key]: value,
    }));
  }

  type PrismaModel = {
    findFirst(args: { where: unknown }): Promise<unknown | null>;
  };

  const model = prisma[table as keyof typeof prisma] as unknown as PrismaModel;
  const record = await model.findFirst({ where: whereClause });

  return !record;
}

export async function getSettings(): Promise<SystemSetting | null> {
  return prisma.systemSetting.findFirst();
}
