import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  const body = await request.json();
  const { condition, ratings, openAnswer } = body;

  if (
    typeof condition !== "string" ||
    !Array.isArray(ratings) ||
    typeof openAnswer !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const record = {
    condition,
    ratings,
    openAnswer,
    timestamp: FieldValue.serverTimestamp(),
  };

  await getDb().collection("survey-responses").add(record);

  return NextResponse.json({ ok: true });
}
