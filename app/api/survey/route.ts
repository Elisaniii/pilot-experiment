import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

const VALID_CONDITIONS = ["ai-high", "ai-low"];

export async function POST(request: Request) {
  const body = await request.json();
  const { condition, evalRatings, normRatings, openAnswer } = body;

  if (
    typeof condition !== "string" ||
    !VALID_CONDITIONS.includes(condition) ||
    !Array.isArray(evalRatings) ||
    !Array.isArray(normRatings) ||
    typeof openAnswer !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const record = {
    condition,
    evalRatings, // 評價情境操弄確認量表（7 題）
    normRatings, // 自我呈現規範約束量表（4 題，第 4 題為反向題）
    openAnswer,
    timestamp: FieldValue.serverTimestamp(),
  };

  const db = getDb();
  await db.collection("survey-responses").add(record);

  // 完成問卷才 +1，供首頁 assign 平衡分配兩組人數
  await db.collection("allocation").doc("counts").set(
    { [condition]: FieldValue.increment(1) },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
