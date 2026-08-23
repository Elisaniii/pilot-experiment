import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getDb } from "@/lib/firebaseAdmin";
import { PILOT2_ADVISORS } from "@/lib/config";

type Msg = { advisorSlot: number; role: "agent" | "user"; text: string; ts: number };

const CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // 去掉易混淆的 0O1I
function genCode(len = 4): string {
  let s = "";
  for (let i = 0; i < len; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return s;
}

function slotForPhase(phase: string): 1 | 2 | null {
  return phase === "conv1" ? 1 : phase === "conv2" ? 2 : null;
}

// 研究者建立新場次：隨機決定兩位顧問誰真人誰 AI
export async function POST() {
  const db = getDb();

  let code = genCode();
  for (let i = 0; i < 5; i++) {
    const existing = await db.collection("pilot2-sessions").doc(code).get();
    if (!existing.exists) break;
    code = genCode();
  }

  const advisorOrder = Math.random() < 0.5 ? ["human", "llm"] : ["llm", "human"];

  await db.collection("pilot2-sessions").doc(code).set({
    code,
    advisorOrder, // [第一段類型, 第二段類型]
    phase: "waiting",
    messages: [],
    operatorTyping: false,
    createdAt: FieldValue.serverTimestamp(),
  });

  return NextResponse.json({ ok: true, code });
}

// 輪詢讀取場次狀態。role=operator 取得完整資料；role=participant 取得去敏版（不含 advisorOrder）
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const role = searchParams.get("role") || "participant";

  if (!code) {
    return NextResponse.json({ ok: false, error: "missing code" }, { status: 400 });
  }

  const doc = await getDb().collection("pilot2-sessions").doc(code).get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const data = doc.data() as {
    phase: string;
    advisorOrder: string[];
    messages?: Msg[];
    operatorTyping?: boolean;
  };
  const phase = data.phase;
  const messages = data.messages || [];

  if (role === "operator") {
    return NextResponse.json({ ok: true, phase, advisorOrder: data.advisorOrder, messages });
  }

  // 受試者版：只回目前這位顧問的資訊與訊息，且絕不回傳 advisorOrder（避免洩漏誰是 AI）
  const slot = slotForPhase(phase);
  const advisor = slot ? PILOT2_ADVISORS[slot - 1] : null;
  const slotMessages = slot ? messages.filter((m) => m.advisorSlot === slot) : [];

  return NextResponse.json({
    ok: true,
    phase,
    slot,
    advisor,
    messages: slotMessages,
    operatorTyping: !!data.operatorTyping,
  });
}
