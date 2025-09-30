"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || !pathname) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams}` : "");
    // SPA遷移ごとにpage_view
    window.gtag?.("config", GA_ID, { page_path: url });
  }, [pathname, searchParams]);

  return null;
}

export default function ClientAnalytics() {
  return (
    <Suspense fallback={null}>
      <Analytics />
    </Suspense>
  );
}