"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [participantId, setParticipantId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleStart = async () => {
    if (participantId.length !== 4) return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push(
          `/pre-questionnaire?condition=${data.conditionId}&school=${encodeURIComponent(data.school.trim())}&pid=${participantId}`
        );
      } else {
        setErrorMsg("找不到此 ID，請確認受試者已完成 Phase 1");
        setStatus("error");
      }
    } catch {
      setErrorMsg("網路錯誤，請重試");
      setStatus("error");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">前導實驗</h1>
          <p className="mt-2 text-sm text-gray-500">請輸入受試者 ID 以開始實驗</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              placeholder="受試者 ID（手機末四碼）"
              value={participantId}
              onChange={(e) => {
                setParticipantId(e.target.value.replace(/\D/g, "").slice(0, 4));
                setStatus("idle");
                setErrorMsg("");
              }}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
            <button
              onClick={handleStart}
              disabled={participantId.length !== 4 || status === "loading"}
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600 disabled:opacity-40"
            >
              {status === "loading" ? "處理中⋯" : "開始"}
            </button>
          </div>

          {status === "error" && (
            <p className="text-xs text-red-500">{errorMsg}</p>
          )}
        </div>
      </div>
    </div>
  );
}
