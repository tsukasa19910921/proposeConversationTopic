import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/db";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = requireSession();

    // ユーザー情報とプロフィール情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "user_not_found" }, { status: 404 });
    }

    // プロフィール完了状態を判定
    // プロフィールが存在し、profileJsonに何らかのデータが入っていれば完了とみなす
    const profileCompleted = user.profile &&
      user.profile.profileJson &&
      typeof user.profile.profileJson === 'string' &&
      user.profile.profileJson.trim() !== '{}' &&
      user.profile.profileJson.trim() !== '';

    return NextResponse.json({
      userId: user.id,
      userIdName: user.userId,
      profileCompleted: Boolean(profileCompleted),
      hasProfile: Boolean(user.profile)
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTH") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}