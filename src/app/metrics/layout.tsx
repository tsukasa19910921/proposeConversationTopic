import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "実績",
  description: "あなたのQRコード読み取り実績と交流記録を確認しましょう",
};

export default function MetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
