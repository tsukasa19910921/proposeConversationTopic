import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "プロフィール設定",
  description: "あなたの興味や趣味を設定して、より良い会話の話題を見つけましょう",
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
