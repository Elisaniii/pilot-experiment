"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { EVAL_CONTEXT_ITEMS, SELF_PRESENTATION_ITEMS, LIKERT_LABELS } from "@/lib/config";

type SurveyItem = { id: string; text: string };

// 合併兩份量表並隨機打亂順序（每位受試者各自洗牌）。
// id 保留題目所屬量表與原始索引（eval-i / norm-i），送出時據此還原分開儲存。
function buildShuffledItems(): SurveyItem[] {
  const items: SurveyItem[] = [
    ...EVAL_CONTEXT_ITEMS.map((text, i) => ({ id: `eval-${i}`, text })),
    ...SELF_PRESENTATION_ITEMS.map((text, i) => ({ id: `norm-${i}`, text })),
  ];
  for (let k = items.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [items[k], items[j]] = [items[j], items[k]];
  }
  return items;
}

function SurveyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const conditionId = params.get("condition") || "";

  // 洗牌只在 client 端掛載後執行一次：避免 SSR 與 client 的 Math.random
  // 產生不同順序而造成 hydration 不一致。作答期間順序固定。
  const [items, setItems] = useState<SurveyItem[]>([]);
  useEffect(() => {
    setItems(buildShuffledItems());
  }, []);

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const allAnswered = items.length > 0 && items.every((it) => ratings[it.id] !== undefined);

  const handleSubmit = async () => {
    if (!allAnswered || submitting) return;
    setSubmitting(true);
    setSubmitError(false);

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          condition: conditionId,
          evalRatings: EVAL_CONTEXT_ITEMS.map((item, i) => ({ item, score: ratings[`eval-${i}`] })),
          normRatings: SELF_PRESENTATION_ITEMS.map((item, i) => ({ item, score: ratings[`norm-${i}`] })),
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      router.push("/complete");
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gray-400">
        載入中⋯⋯
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-800">事後問卷</h1>
        <p className="mt-1 text-sm text-gray-500">
          請根據你剛才的對話體驗，回答以下問題。
        </p>

        <div className="mt-8 space-y-6">
          {items.map((it, qi) => (
            <div key={it.id} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                {qi + 1}. {it.text}
              </p>
              <div className="mt-4 flex justify-between gap-1">
                {LIKERT_LABELS.map((label, li) => (
                  <button
                    key={li}
                    onClick={() => setRatings((prev) => ({ ...prev, [it.id]: li + 1 }))}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs transition ${
                      ratings[it.id] === li + 1
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-base">{li + 1}</span>
                    <span className="hidden sm:block leading-tight">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {submitError && (
          <p className="mt-4 text-center text-sm text-red-500">
            提交失敗，請檢查網路連線後再試一次。
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="mt-6 w-full rounded-xl bg-blue-600 py-3 text-white font-medium transition hover:bg-blue-700 disabled:bg-gray-300"
        >
          {submitting ? "提交中⋯⋯" : "提交問卷"}
        </button>
      </div>
    </div>
  );
}

export default function SurveyPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">載入中⋯⋯</div>}>
      <SurveyContent />
    </Suspense>
  );
}
