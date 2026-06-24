"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { SURVEY_ITEMS, LIKERT_LABELS } from "@/lib/config";

function SurveyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const conditionId = params.get("condition") || "";

  const [ratings, setRatings] = useState<(number | null)[]>(
    Array(SURVEY_ITEMS.length).fill(null)
  );
  const [openAnswer, setOpenAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const allAnswered = ratings.every((r) => r !== null) && openAnswer.trim().length > 0;

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
          ratings: SURVEY_ITEMS.map((item, i) => ({
            item,
            score: ratings[i],
          })),
          openAnswer,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      router.push(`/post-questionnaire?condition=${encodeURIComponent(conditionId)}`);
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

        <div className="mt-8 space-y-8">
          {SURVEY_ITEMS.map((item, qi) => (
            <div key={qi} className="rounded-xl bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                {qi + 1}. {item}
              </p>
              <div className="mt-4 flex justify-between gap-1">
                {LIKERT_LABELS.map((label, li) => (
                  <button
                    key={li}
                    onClick={() => {
                      const next = [...ratings];
                      next[qi] = li + 1;
                      setRatings(next);
                    }}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs transition ${
                      ratings[qi] === li + 1
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

          {/* 開放題 */}
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-gray-700">
              {SURVEY_ITEMS.length + 1}. 請問你認為這次對話的目的是什麼？
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
          className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-white font-medium transition hover:bg-blue-700 disabled:bg-gray-300"
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
