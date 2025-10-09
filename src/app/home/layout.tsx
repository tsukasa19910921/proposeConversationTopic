import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ホーム",
  description: "あなたのQRコードを表示し、相手のQRコードを読み取って会話の話題を見つけましょう",
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
