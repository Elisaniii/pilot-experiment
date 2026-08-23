"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  const handleStart = async () => {
    if (status === "loading") return;
    setStatus("loading");
    try {
      const res = await fetch("/api/assign", { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        // 分組結果存在 sessionStorage，不放進網址，避免受試者看到條件
        sessionStorage.setItem("pilotCondition", data.conditionId);
        router.push("/experiment");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">歡迎參加本次研究</h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            接下來你會與一位對話者進行一段簡短的線上對談，結束後填寫一份簡短問卷。
            準備好之後，請按下方按鈕開始。
          </p>
        </div>

        <button
          onClick={handleStart}
          disabled={status === "loading"}
          className="w-full rounded-xl bg-blue-600 py-3 text-white font-medium transition hover:bg-blue-700 disabled:opacity-40"
        >
          {status === "loading" ? "準備中⋯" : "開始"}
        </button>

        {status === "error" && (
          <p className="text-sm text-red-500">連線發生問題，請重新整理頁面後再試一次。</p>
        )}
      </div>
    </div>
  );
}
