import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "前導實驗",
  description: "自我揭露實驗 - 前導測試",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
