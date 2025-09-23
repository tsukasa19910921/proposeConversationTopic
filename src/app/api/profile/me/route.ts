// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getProfile, upsertProfile } from "@/lib/repos/profile";

export async function GET() {
  try {
    const { userId } = requireSession();
    const profile = await getProfile(userId);

    if (!profile) {
      return NextResponse.json({}, { status: 200 });
    }

    return NextResponse.json(profile);
  } catch (error: any) {
    if (error.message === "UNAUTH" || error.message === "EXPIRED" || error.message === "BADSIG") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { userId } = requireSession();
    const profileData = await req.json();

    await upsertProfile(userId, profileData);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    if (error.message === "UNAUTH" || error.message === "EXPIRED" || error.message === "BADSIG") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    if (error.message.includes("Profile data too large")) {
      return NextResponse.json({ error: "profile_too_large" }, { status: 400 });
    }
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}