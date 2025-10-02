// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { withHandler } from "@/lib/http";
import { verifyPassword } from "@/lib/repos/users";
import { setSessionCookie } from "@/lib/session";

// 入力検証スキーマ
const LoginSchema = z.object({
  userId: z.string().min(3, "User ID must be at least 3 characters").max(32, "User ID must be at most 32 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be at most 128 characters"),
});

// ログインハンドラー（Zodバリデーション付き）
export const POST = withHandler(LoginSchema, async (_req, { userId, password }) => {
  // パスワード検証
  const user = await verifyPassword(userId, password);
  if (!user) {
    return NextResponse.json(
      { error: "invalid_credentials", message: "Invalid username or password" },
      { status: 401 }
    );
  }

  // セッションCookie発行
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, user.id);

  return response;
});