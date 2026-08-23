import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/firebaseAdmin";
import { PILOT2_ADVISORS, PILOT2_QUESTIONS_A, PILOT2_QUESTIONS_B } from "@/lib/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Msg = { advisorSlot: number; role: "agent" | "user"; text: string; ts: number };

function slotForPhase(phase: string): 1 | 2 | null {
  return phase === "conv1" ? 1 : phase === "conv2" ? 2 : null;
}

// 為 LLM 顧問生成一則回覆草稿，供研究者審閱後送出
export async function POST(request: Request) {
  const { code } = await request.json();
  if (typeof code !== "string") {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const doc = await getDb().collection("pilot2-sessions").doc(code).get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const data = doc.data() as { phase: string; messages?: Msg[] };
  const slot = slotForPhase(data.phase);
  if (!slot) {
    return NextResponse.json({ ok: false, error: "not in a conversation phase" }, { status: 409 });
  }

  const advisor = PILOT2_ADVISORS[slot - 1];
  const questions = slot === 1 ? PILOT2_QUESTIONS_A : PILOT2_QUESTIONS_B;
  const slotMessages = (data.messages || []).filter((m) => m.advisorSlot === slot);

  const conv: Anthropic.MessageParam[] = slotMessages.map((m) => ({
    role: m.role === "agent" ? "assistant" : "user",
    content: m.text,
  }));
  while (conv.length > 0 && conv[0].role === "assistant") conv.shift();

  const system =
    `你是「${advisor.name}」，一位真人職涯顧問，正在與一位大學生進行輕鬆的一對一線上對談。` +
    `請根據對話脈絡，用繁體中文寫出「下一則」你要傳給對方的訊息：語氣自然、溫暖、像真人在聊天（可用少量語氣詞），長度約 1–3 句。\n\n` +
    `你可以參考以下訪談問題作為對話主軸，依進度自然帶出（不必逐字照唸，也不要一次問很多）：\n` +
    questions.map((q, i) => `${i + 1}. ${q}`).join("\n") +
    `\n\n只輸出你要傳出的訊息內容本身，不要加引號或任何說明。`;

  let messages: Anthropic.MessageParam[];
  if (conv.length === 0) {
    messages = [{ role: "user", content: "（對話尚未開始，請先簡單打招呼，再自然帶出第一個問題。）" }];
  } else if (conv[conv.length - 1].role === "assistant") {
    messages = [...conv, { role: "user", content: "（請自然接續，給出下一則訊息。）" }];
  } else {
    messages = conv;
  }

  const resp = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system,
    messages,
  });

  const draft = resp.content[0].type === "text" ? resp.content[0].text.trim() : "";
  return NextResponse.json({ ok: true, draft });
}
