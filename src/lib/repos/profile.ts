import { prisma } from "@/lib/db";

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });

  return profile ? JSON.parse(profile.profileJson) : null;
}

export async function upsertProfile(userId: string, profileData: any) {
  const profileJson = JSON.stringify(profileData);

  if (profileJson.length > 8192) {
    throw new Error("Profile data too large (max 8KB)");
  }

  return await prisma.profile.upsert({
    where: { userId },
    create: {
      userId,
      profileJson: profileJson,
    },
    update: {
      profileJson: profileJson,
    },
  });
}