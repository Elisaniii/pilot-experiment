import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  const body = await request.json();
  const { participantId, condition, ratings, openAnswer, openAnswer2 } = body;

  if (
    typeof participantId !== "string" ||
    typeof condition !== "string" ||
    !Array.isArray(ratings) ||
    typeof openAnswer !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const VALID_CONDITIONS = ["human-high", "human-low", "ai-high", "ai-low"];
  if (!VALID_CONDITIONS.includes(condition)) {
    return NextResponse.json({ ok: false, error: "invalid condition" }, { status: 400 });
  }

  const record = {
    participantId,
    condition,
    ratings,
    openAnswer,
    openAnswer2: typeof openAnswer2 === "string" ? openAnswer2 : "",
    timestamp: FieldValue.serverTimestamp(),
  };

  const db = getDb();
  await db.collection("survey-responses").add(record);

  // 只有完成問卷才算一次完成，用於後續分配平衡
  await db.collection("allocation").doc("counts").set(
    { [condition]: FieldValue.increment(1) },
    { merge: true }
  );

  return NextResponse.json({ ok: true });
}
