"use client";
import { CONDITIONS } from "@/lib/config";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [school, setSchool] = useState("");

  const handleSelect = (conditionId: string) => {
    if (!school.trim()) {
      alert("請填寫受試者的學校/公司名稱");
      return;
    }
    router.push(
      `/experiment?condition=${conditionId}&school=${encodeURIComponent(school.trim())}`
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-800">前導實驗</h1>
          <p className="mt-2 text-sm text-gray-500">研究者請選擇實驗條件</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
          <p className="text-sm font-medium text-gray-600">受試者基本資料（真人組必填）</p>
          <input
            type="text"
            placeholder="學校/公司名稱（例：台灣大學）"
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
          />
        </div>

        <div className="space-y-3">
          {Object.values(CONDITIONS).map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className="w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition hover:border-blue-300 hover:shadow-sm"
            >
              {c.agentAvatar.startsWith("/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.agentAvatar} alt={c.agentName} width={24} height={24} className="inline rounded-full object-cover" />
              ) : (
                <span className="text-lg">{c.agentAvatar}</span>
              )}
              <span className="ml-3 font-medium text-gray-700">{c.label}</span>
              <span className="ml-2 text-sm text-gray-400">({c.agentName})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
