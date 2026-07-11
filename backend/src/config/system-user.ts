// src/config/system-user.ts

import prisma from "./prisma";

let cachedSystemUserId: string | null = null;

export async function getSystemUserId(): Promise<string> {
  if (cachedSystemUserId) return cachedSystemUserId;

  const user = await prisma.user.findFirstOrThrow({
    where: { email: "system@internal.local" },
  });

  cachedSystemUserId = user.id;
  return cachedSystemUserId;
}