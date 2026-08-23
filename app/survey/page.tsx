"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { EVAL_CONTEXT_ITEMS, SELF_PRESENTATION_ITEMS, LIKERT_LABELS } from "@/lib/config";

function LikertItem({
  index,
  item,
  value,
  onSelect,
}: {
  index: number;
  item: string;
  value: number | null;
  onSelect: (score: number) => void;
}) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-700">
        {index}. {item}
      </p>
      <div className="mt-4 flex justify-between gap-1">
        {LIKERT_LABELS.map((label, li) => (
          <button
            key={li}
            onClick={() => onSelect(li + 1)}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs transition ${
              value === li + 1
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
  );
}

function SurveyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const conditionId = params.get("condition") || "";

  const [evalRatings, setEvalRatings] = useState<(number | null)[]>(
    Array(EVAL_CONTEXT_ITEMS.length).fill(null)
  );
  const [normRatings, setNormRatings] = useState<(number | null)[]>(
    Array(SELF_PRESENTATION_ITEMS.length).fill(null)
  );
  const [openAnswer, setOpenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const allAnswered =
    evalRatings.every((r) => r !== null) &&
    normRatings.every((r) => r !== null) &&
    openAnswer.trim().length > 0;

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
          evalRatings: EVAL_CONTEXT_ITEMS.map((item, i) => ({ item, score: evalRatings[i] })),
          normRatings: SELF_PRESENTATION_ITEMS.map((item, i) => ({ item, score: normRatings[i] })),
          openAnswer,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      router.push("/complete");
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-semibold text-gray-800">事後問卷</h1>
        <p className="mt-1 text-sm text-gray-500">
          請根據你剛才的對話體驗，回答以下問題。
        </p>

        {/* 一、評價情境操弄確認 */}
        <div className="mt-8">
          <h2 className="mb-4 text-base font-semibold text-gray-700">一、對於這次對話的看法</h2>
          <div className="space-y-6">
            {EVAL_CONTEXT_ITEMS.map((item, qi) => (
              <LikertItem
                key={qi}
                index={qi + 1}
                item={item}
                value={evalRatings[qi]}
                onSelect={(score) => {
                  const next = [...evalRatings];
                  next[qi] = score;
                  setEvalRatings(next);
                }}
              />
            ))}
          </div>
        </div>

        {/* 二、自我呈現規範約束 */}
        <div className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-gray-700">二、對於自我表達的看法</h2>
          <div className="space-y-6">
            {SELF_PRESENTATION_ITEMS.map((item, qi) => (
              <LikertItem
                key={qi}
                index={qi + 1}
                item={item}
                value={normRatings[qi]}
                onSelect={(score) => {
                  const next = [...normRatings];
                  next[qi] = score;
                  setNormRatings(next);
                }}
              />
            ))}
          </div>
        </div>

        {/* 三、開放題 */}
        <div className="mt-10">
          <h2 className="mb-4 text-base font-semibold text-gray-700">三、開放式問題</h2>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              請問你認為這次對話的目的是什麼？
            </p>
            <textarea
              value={openAnswer}
              onChange={(e) => setOpenAnswer(e.target.value)}
              rows={4}
              placeholder="請輸入你的想法⋯⋯"
              className="mt-3 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
            />
          </div>
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
