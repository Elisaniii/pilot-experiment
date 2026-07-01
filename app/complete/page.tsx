"use client";
import Link from "next/link";

export default function CompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="max-w-lg space-y-4 text-center">
        <h1 className="text-xl font-semibold text-gray-800">感謝你的參與！</h1>
        <p className="text-sm text-gray-500">前導實驗已完成，你可以關閉此頁面。</p>
        <div className="rounded-xl bg-gray-50 p-5 text-left text-sm leading-relaxed text-gray-600">
          <p className="mb-2 font-medium text-gray-700">研究說明</p>
          <p>
            感謝你參與本次研究。在此需要向你說明，方才對話前所提供的情境描述，有部分是基於研究設計的需要，並非完全如所述，也不會產出任何評估報告或其他結果。對此可能造成的不適，我們深感抱歉。
          </p>
          <p className="mt-2">
            本研究旨在了解人們在不同線上對話情境中的溝通方式，由於研究仍在進行中，為避免影響後續資料的有效性，目前無法透露完整的研究目的與設計細節。待所有資料收集完畢後，我們將提供完整說明。
          </p>
          <p className="mt-2">
            為維護研究品質，懇請你不要與他人討論本次研究的內容與流程。若你因參與本研究而感到任何不適，歡迎隨時與研究團隊聯繫。再次感謝你的參與。
          </p>
        </div>
        <Link
          href="/"
          className="inline-block rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          重新開始
        </Link>
      </div>
    </div>
  );
}
