"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function ClientAnalytics() {
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