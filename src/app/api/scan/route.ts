import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/repos/profile";
import { incrScanOutIn } from "@/lib/repos/counters";
import { generateTopic } from "@/lib/llm";
import { canScan } from "@/lib/cooldown";

export async function POST(req: NextRequest) {
  try {
    const { userId: scannerId } = requireSession();
    const { scannedSid } = await req.json();

    if (!scannedSid) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    if (scannerId === scannedSid) {
      return NextResponse.json({ error: "self_scan" }, { status: 400 });
    }

    const scannedUser = await prisma.user.findUnique({
      where: { id: scannedSid },
    });

    if (!scannedUser) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    const cd = await canScan(scannerId, scannedUser.id);
    if (!cd.ok) {
      return NextResponse.json({
        error: "cooldown",
        message: "時間をおいてトライしてください"
      }, { status: 429 });
    }

    const [profileA, profileB] = await Promise.all([
      getProfile(scannerId),
      getProfile(scannedUser.id),
    ]);

    const message = await generateTopic(profileA ?? {}, profileB ?? {});

    await incrScanOutIn(scannerId, scannedUser.id);

    return NextResponse.json({ message });
  } catch (error: any) {
    if (error.message === "UNAUTH" || error.message === "EXPIRED" || error.message === "BADSIG") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("Scan error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}