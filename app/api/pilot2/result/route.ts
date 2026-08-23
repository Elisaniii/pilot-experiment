import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

// 儲存辨別任務結果：受試者的開放題答案與二選一判斷
export async function POST(request: Request) {
  const { code, openAnswer, guessSlot } = await request.json();

  if (typeof code !== "string" || (guessSlot !== 1 && guessSlot !== 2)) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const ref = getDb().collection("pilot2-sessions").doc(code);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const advisorOrder = (doc.data() as { advisorOrder: string[] }).advisorOrder;
  const actualAiSlot = advisorOrder.indexOf("llm") + 1; // 實際上是 AI 的那一段
  const correct = guessSlot === actualAiSlot; // 受試者是否正確辨認出 AI

  const result = {
    openAnswer: typeof openAnswer === "string" ? openAnswer : "",
    guessSlot, // 受試者認為「非真人」的是第幾位（1=陳、2=林）
    actualAiSlot,
    correct,
    ts: Date.now(),
  };

  await ref.update({ result, phase: "done" });

  // 不回傳正確與否，避免受試者得知答案
  return NextResponse.json({ ok: true });
}
