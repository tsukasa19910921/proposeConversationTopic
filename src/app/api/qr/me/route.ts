// Force dynamic execution (required for cookies and Prisma)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Force dynamic execution (required for cookies)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { generateQR } from "@/lib/qr";

export async function GET() {
  try {
    const { userId } = requireSession();
    const url = `${process.env.APP_BASE_URL}/scan?sid=${userId}`;
    const svg = await generateQR(url);

    return NextResponse.json({ url, svg });
  } catch (error: any) {
    if (error.message === "UNAUTH" || error.message === "EXPIRED" || error.message === "BADSIG") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    console.error("QR generation error:", error);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}