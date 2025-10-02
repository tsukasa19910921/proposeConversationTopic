// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { generateQR } from "@/lib/qr";
import { env } from "@/lib/env";

// QRコード取得ハンドラー（withAuth で認証チェック）
export const GET = withAuth(async (_req, me) => {
  const url = `${env.APP_BASE_URL}/scan?sid=${me.userId}`;
  const svg = await generateQR(url);

  return NextResponse.json({ url, svg });
});