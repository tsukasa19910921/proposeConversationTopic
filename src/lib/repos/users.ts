import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function createUser(userId: string, password: string) {
  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  return await prisma.user.create({
    data: {
      userId,
      passwordHash,
    },
  });
}

export async function getUserByUserId(userId: string) {
  return await prisma.user.findUnique({
    where: { userId },
  });
}

export async function verifyPassword(userId: string, password: string) {
  const user = await getUserByUserId(userId);
  if (!user) return null;

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
  if (user.passwordHash !== passwordHash) return null;

  return user;
}