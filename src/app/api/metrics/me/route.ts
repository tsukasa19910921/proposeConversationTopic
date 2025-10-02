// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-utils";
import { getCounters } from "@/lib/repos/counters";

// 実績取得ハンドラー（withAuth で認証チェック）
export const GET = withAuth(async (_req, me) => {
  const counters = await getCounters(me.userId);

  return NextResponse.json({
    scanOut: counters.scanOut,
    scanIn: counters.scanIn,
  });
});