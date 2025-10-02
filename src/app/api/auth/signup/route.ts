// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { withHandler } from "@/lib/http";
import { createUser, getUserByUserId } from "@/lib/repos/users";
import { setSessionCookie } from "@/lib/session";

// 入力検証スキーマ（ログインと同じ）
const SignupSchema = z.object({
  userId: z.string().min(3, "User ID must be at least 3 characters").max(32, "User ID must be at most 32 characters"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password must be at most 128 characters"),
});

// サインアップハンドラー（Zodバリデーション付き）
export const POST = withHandler(SignupSchema, async (_req, { userId, password }) => {
  // ユーザーの重複チェック
  const existingUser = await getUserByUserId(userId);
  if (existingUser) {
    return NextResponse.json(
      { error: "user_exists", message: "User already exists" },
      { status: 409 }
    );
  }

  // 新規ユーザー作成
  const user = await createUser(userId, password);

  // セッションCookie発行
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, user.id);

  return response;
});