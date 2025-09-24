// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getProfile, upsertProfile } from "@/lib/repos/profile";
import { packProfileFromUI, expandProfileForUI } from "@/lib/profile-shape";

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
    const input = await req.json();

    // 入力を正規化: まず現行UIに存在するものだけに正規化してから、最小構造にパック
    const packed = packProfileFromUI(expandProfileForUI(input));

    await upsertProfile(userId, packed);

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