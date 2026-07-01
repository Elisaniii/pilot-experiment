import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

export async function POST(request: Request) {
  const body = await request.json();
  const { participantId, condition, messages } = body;

  if (
    typeof participantId !== "string" ||
    typeof condition !== "string" ||
    !Array.isArray(messages)
  ) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  await getDb()
    .collection("conversation-logs")
    .add({ participantId, condition, messages, timestamp: FieldValue.serverTimestamp() });

  return NextResponse.json({ ok: true });
}
