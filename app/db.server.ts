import { PrismaClient } from "@prisma/client";

declare global {
  let __prisma: PrismaClient
}

if (!global.__prisma) {
  global.__prisma = new PrismaClient();
}

global.__prisma.$connect();

export const prisma = global.__prisma;
