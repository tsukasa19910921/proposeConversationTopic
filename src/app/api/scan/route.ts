// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuthAndValidation } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { getProfile } from "@/lib/repos/profile";
import { incrScanOutIn } from "@/lib/repos/counters";
import { generateTopic } from "@/lib/llm";
import { canScan } from "@/lib/cooldown";

// 入力検証スキーマ
const ScanSchema = z.object({
  scannedSid: z.string().uuid("Invalid user ID format"),
});

// スキャンハンドラー（Zodバリデーション + 認証チェック）
export const POST = withAuthAndValidation(ScanSchema, async (_req, me, { scannedSid }) => {
  // 自己スキャンチェック
  if (me.userId === scannedSid) {
    return NextResponse.json(
      { error: "self_scan", message: "自分のQRコードはスキャンできません" },
      { status: 400 }
    );
  }

  // スキャン対象ユーザーの存在確認
  const scannedUser = await prisma.user.findUnique({
    where: { id: scannedSid },
  });

  if (!scannedUser) {
    return NextResponse.json(
      { error: "user_not_found", message: "ユーザーが見つかりませんでした" },
      { status: 404 }
    );
  }

  // クールダウンチェック
  const cd = await canScan(me.userId, scannedUser.id);
  if (!cd.ok) {
    return NextResponse.json(
      {
        error: "cooldown",
        message: "時間をおいてトライしてください"
      },
      { status: 429 }
    );
  }

  // 両者のプロフィール取得
  const [profileA, profileB] = await Promise.all([
    getProfile(me.userId),
    getProfile(scannedUser.id),
  ]);

  // AI話題生成
  let message: string;
  try {
    message = await generateTopic(profileA ?? {}, profileB ?? {});
  } catch (llmError: any) {
    console.error("LLM error in scan:", llmError);

    // サービス利用不可の場合
    if (llmError.message === "SERVICE_UNAVAILABLE") {
      return NextResponse.json(
        {
          error: "service_unavailable",
          message: "サービスが一時的に利用できません。少し時間をおいてから再度お試しください。"
        },
        { status: 503 }
      );
    }

    // その他の生成エラー
    if (llmError.message === "GENERATION_FAILED") {
      return NextResponse.json(
        {
          error: "generation_failed",
          message: "話題の生成に失敗しました。もう一度QRコードを読み取ってください。"
        },
        { status: 500 }
      );
    }

    // 予期しないエラーは再スロー
    throw llmError;
  }

  // カウンター更新
  await incrScanOutIn(me.userId, scannedUser.id);

  // 成功レスポンス
  return NextResponse.json({ message });
});