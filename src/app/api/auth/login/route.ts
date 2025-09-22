// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Force dynamic execution (required for cookies)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/repos/users";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const user = await verifyPassword(userId, password);
    if (!user) {
      return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, user.id);

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}