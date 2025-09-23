// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getCounters } from "@/lib/repos/counters";

export async function GET() {
  try {
    const { userId } = requireSession();
    const counters = await getCounters(userId);

    return NextResponse.json({
      scanOut: counters.scanOut,
      scanIn: counters.scanIn,
    });
  } catch (error: any) {
    if (error.message === "UNAUTH" || error.message === "EXPIRED" || error.message === "BADSIG") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("Get metrics error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}