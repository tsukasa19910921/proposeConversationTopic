import { prisma } from "@/lib/db";

export async function getCounters(userId: string) {
  const counters = await prisma.counters.findUnique({
    where: { userId },
  });

  return {
    scanOut: counters?.scanOutCount ?? 0,
    scanIn: counters?.scanInCount ?? 0,
  };
}

export async function incrScanOutIn(scannerId: string, scannedId: string) {
  await prisma.$transaction([
    prisma.counters.upsert({
      where: { userId: scannerId },
      create: {
        userId: scannerId,
        scanOutCount: 1,
        scanInCount: 0,
      },
      update: {
        scanOutCount: { increment: 1 },
      },
    }),
    prisma.counters.upsert({
      where: { userId: scannedId },
      create: {
        userId: scannedId,
        scanOutCount: 0,
        scanInCount: 1,
      },
      update: {
        scanInCount: { increment: 1 },
      },
    }),
  ]);
}