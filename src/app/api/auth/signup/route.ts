// Force dynamic execution (required for cookies)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createUser, getUserByUserId } from "@/lib/repos/users";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { userId, password } = await req.json();

    if (!userId || !password) {
      return NextResponse.json({ error: "bad_request" }, { status: 400 });
    }

    const existingUser = await getUserByUserId(userId);
    if (existingUser) {
      return NextResponse.json({ error: "user_exists" }, { status: 409 });
    }

    const user = await createUser(userId, password);

    const response = NextResponse.json({ ok: true });
    setSessionCookie(response, user.id);

    return response;
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}