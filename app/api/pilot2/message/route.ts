import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";

function slotForPhase(phase: string): 1 | 2 | null {
  return phase === "conv1" ? 1 : phase === "conv2" ? 2 : null;
}

// 送出一則訊息：from=participant 存為 user，from=operator 存為 agent（顧問）
export async function POST(request: Request) {
  const { code, from, text } = await request.json();

  if (
    typeof code !== "string" ||
    (from !== "participant" && from !== "operator") ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const ref = getDb().collection("pilot2-sessions").doc(code);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const phase = (doc.data() as { phase: string }).phase;
  const slot = slotForPhase(phase);
  if (!slot) {
    return NextResponse.json({ ok: false, error: "not in a conversation phase" }, { status: 409 });
  }

  const message = {
    advisorSlot: slot,
    role: from === "participant" ? "user" : "agent",
    text: text.trim(),
    ts: Date.now(),
  };

  const update: Record<string, unknown> = { messages: FieldValue.arrayUnion(message) };
  // 顧問送出訊息後，清掉打字中狀態
  if (from === "operator") update.operatorTyping = false;
  await ref.update(update);
  return NextResponse.json({ ok: true });
}
