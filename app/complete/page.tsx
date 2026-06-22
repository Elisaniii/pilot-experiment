"use client";
import Link from "next/link";

export default function CompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-4">
        <span className="text-5xl">✅</span>
        <h1 className="text-xl font-semibold text-gray-800">感謝你的參與！</h1>
        <p className="text-sm text-gray-500">前導實驗已完成，你可以關閉此頁面。</p>
        <Link
          href="/"
          className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          重新開始（下一位受試者）
        </Link>
      </div>
    </div>
  );
}
