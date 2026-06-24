import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  const body = await request.json();
  const { condition, answers } = body;

  if (typeof condition !== "string" || !Array.isArray(answers)) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  await getDb().collection("post-questionnaire-responses").add({
    condition,
    answers,
    timestamp: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true });
}
