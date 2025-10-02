/**
 * API共通ユーティリティ
 * 認証チェックとエラーハンドリングの共通化
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { z } from "zod";
import { withHandler } from "@/lib/http";

/**
 * 認証済みユーザー情報
 */
export type AuthedUser = {
  userId: string;
};

/**
 * 認証が必要なAPIハンドラーの型
 */
export type AuthedHandler = (
  req: NextRequest,
  me: AuthedUser
) => Promise<NextResponse>;

/**
 * 認証チェック付きハンドラー
 * @param handler - 認証済みユーザー情報を受け取るハンドラー
 * @returns Next.jsのAPIハンドラー
 */
export function withAuth(handler: AuthedHandler) {
  return async (req: NextRequest) => {
    try {
      // セッションから認証情報を取得
      const me = requireSession();

      // 認証済みユーザー情報を渡してハンドラーを実行
      return await handler(req, me);
    } catch (e: any) {
      // エラーハンドリング
      return handleApiError(e);
    }
  };
}

/**
 * 認証チェック + Zodバリデーション付きハンドラー
 * @param schema - Zodスキーマ
 * @param handler - 認証済みユーザー情報とバリデーション済みデータを受け取るハンドラー
 * @returns Next.jsのAPIハンドラー
 */
export function withAuthAndValidation<T extends z.ZodTypeAny>(
  schema: T,
  handler: (req: NextRequest, me: AuthedUser, data: z.infer<T>) => Promise<NextResponse>
) {
  return withHandler(schema, async (req, data) => {
    try {
      // セッションから認証情報を取得
      const me = requireSession();

      // 認証済みユーザー情報とバリデーション済みデータを渡してハンドラーを実行
      return await handler(req, me, data);
    } catch (e: any) {
      // エラーハンドリング
      return handleApiError(e);
    }
  });
}

/**
 * 統一エラーハンドリング
 * @param e - エラーオブジェクト
 * @returns エラーレスポンス
 */
export function handleApiError(e: any): NextResponse {
  const msg = typeof e?.message === "string" ? e.message : "";

  // 既知のアプリケーションエラーを4xxにマッピング

  // 認証関連エラー
  if (msg === "UNAUTH") {
    return NextResponse.json(
      { error: "unauthorized", message: "Authentication required" },
      { status: 401 }
    );
  }

  if (msg === "EXPIRED") {
    return NextResponse.json(
      { error: "session_expired", message: "Session has expired" },
      { status: 401 }
    );
  }

  if (msg === "BADSIG") {
    return NextResponse.json(
      { error: "bad_signature", message: "Invalid session signature" },
      { status: 401 }
    );
  }

  if (msg === "INVALID_FORMAT") {
    return NextResponse.json(
      { error: "invalid_session", message: "Invalid session format" },
      { status: 400 }
    );
  }

  // ビジネスロジックエラー
  if (msg === "USER_EXISTS") {
    return NextResponse.json(
      { error: "user_exists", message: "User already exists" },
      { status: 409 }
    );
  }

  if (msg === "INVALID_CREDENTIALS") {
    return NextResponse.json(
      { error: "invalid_credentials", message: "Invalid username or password" },
      { status: 401 }
    );
  }

  if (msg === "SELF_SCAN") {
    return NextResponse.json(
      { error: "self_scan", message: "Cannot scan your own QR code" },
      { status: 400 }
    );
  }

  if (msg === "USER_NOT_FOUND") {
    return NextResponse.json(
      { error: "user_not_found", message: "User not found" },
      { status: 404 }
    );
  }

  if (msg === "COOLDOWN") {
    return NextResponse.json(
      { error: "cooldown", message: "Please wait before scanning again" },
      { status: 429 }
    );
  }

  // LLMエラー
  if (msg === "SERVICE_UNAVAILABLE") {
    return NextResponse.json(
      { error: "service_unavailable", message: "AI service temporarily unavailable" },
      { status: 503 }
    );
  }

  if (msg === "GENERATION_FAILED") {
    return NextResponse.json(
      { error: "generation_failed", message: "Failed to generate topic" },
      { status: 500 }
    );
  }

  // 想定外のエラーは500エラーとして処理
  console.error("Unexpected error:", e);
  return NextResponse.json(
    { error: "internal", message: "Internal server error" },
    { status: 500 }
  );
}