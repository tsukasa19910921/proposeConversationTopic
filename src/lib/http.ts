/**
 * HTTPリクエスト処理のヘルパー関数
 * Zodスキーマによる入力検証を共通化
 */

import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

/**
 * Zodスキーマを使った入力検証付きハンドラー
 * @param schema - Zodスキーマ（入力検証用）
 * @param handler - 実際の処理ロジック
 * @returns Next.jsのAPIハンドラー
 */
export function withHandler<T extends z.ZodTypeAny>(
  schema: T,
  handler: (req: NextRequest, data: z.infer<T>) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      // GETリクエストの場合はURLパラメータ、それ以外はJSONボディをパース
      const data = schema.parse(
        req.method === "GET"
          ? Object.fromEntries(new URL(req.url).searchParams)
          : await req.json()
      );

      // 検証済みデータでハンドラーを実行
      return await handler(req, data);
    } catch (e) {
      // Zodのバリデーションエラー
      if (e instanceof ZodError) {
        return NextResponse.json(
          {
            error: "bad_request",
            message: "Invalid request data",
            issues: e.issues.map(issue => ({
              path: issue.path.join("."),
              message: issue.message
            }))
          },
          { status: 400 }
        );
      }

      // その他のエラー
      console.error("Handler error:", e);
      return NextResponse.json(
        { error: "internal", message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

/**
 * オプショナルなボディ検証付きハンドラー（GETリクエスト用）
 * @param handler - 実際の処理ロジック
 * @returns Next.jsのAPIハンドラー
 */
export function withoutBodyHandler(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (e) {
      console.error("Handler error:", e);
      return NextResponse.json(
        { error: "internal", message: "Internal server error" },
        { status: 500 }
      );
    }
  };
}