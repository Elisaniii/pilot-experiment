import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { CONDITIONS, PILOT_QUESTIONS } from "@/lib/config";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function buildSystemPrompt(conditionId: string, questionIndex: number, turnIndex: number): string {
  const condition = CONDITIONS[conditionId];
  if (!condition) return "你是一位訪談顧問，請用繁體中文自然地回應受試者的答案（1-2 句話）。不要自行提問下一個問題。";

  const isHuman = condition.agent === "human";
  const isHighEval = condition.eval === "high";
  const isLastQuestion = questionIndex === PILOT_QUESTIONS.length - 1;
  const currentQuestion = PILOT_QUESTIONS[questionIndex];

  const personaDesc = isHuman
    ? `你是${condition.agentName}，一位${isHighEval ? "職涯發展中心的職涯顧問" : "課外活動組的興趣探索顧問"}。你是真實的人類顧問。`
    : `你是 ${condition.agentName}，一個${isHighEval ? "職涯發展中心的 AI 職涯助理" : "課外活動組的 AI 興趣探索助理"}。`;

  const evalContext = isHighEval
    ? "此次對談目的是評估受試者在未來職場上的競爭力。"
    : "此次對談目的是了解大學生的社團興趣與課程探索方向。";

  const toneDesc = isHuman
    ? "你的回應風格溫暖、自然，帶有人際互動感。可以使用語氣詞，讓對話感覺像真實的人在聊天。"
    : "你的回應風格簡潔、中性、有效率，像 AI 助理，不帶多餘的語氣詞。";

  let taskDesc: string;
  if (turnIndex === 1) {
    // 追問後的回合：收尾，不再追問
    taskDesc = isLastQuestion
      ? `受試者剛回應了你的追問。請給予適當的結束語感謝他們今天的分享（1-2 句話）。不要繼續追問。\n\n請以下列 JSON 格式回應，不要加其他文字：{"text": "你的回應", "followUp": false}`
      : `受試者剛回應了你的追問。請給予簡短回應（1 句話），表達理解即可。不要繼續追問。\n\n請以下列 JSON 格式回應，不要加其他文字：{"text": "你的回應", "followUp": false}`;
  } else if (isLastQuestion) {
    taskDesc = `你剛才問了受試者：「${currentQuestion}」\n請根據受試者的回答給予自然的回應（1-2 句話），可選擇性追問一個相關問題（例如請他們舉例或補充說明）。若你決定追問，設 followUp 為 true；若不追問，給予適當的結束語感謝他們的分享，設 followUp 為 false。\n\n請以下列 JSON 格式回應，不要加其他文字：{"text": "你的回應", "followUp": true 或 false}`;
  } else {
    taskDesc = `你剛才問了受試者：「${currentQuestion}」\n請根據受試者的回答給予自然的回應（1-2 句話），可選擇性追問一個相關問題（例如請他們舉例或補充說明）。若你決定追問，設 followUp 為 true；若不追問，設 followUp 為 false。不要問下一道制式問題。\n\n請以下列 JSON 格式回應，不要加其他文字：{"text": "你的回應", "followUp": true 或 false}`;
  }

  return `${personaDesc}\n\n${evalContext}\n\n${toneDesc}\n\n${taskDesc}\n\n請用繁體中文回應。text 欄位的長度控制在 1-2 句話，不要過長。`;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function normalizeHistory(history: ChatMessage[]): Anthropic.MessageParam[] {
  // Merge consecutive same-role messages
  const merged: ChatMessage[] = [];
  for (const msg of history) {
    if (merged.length > 0 && merged[merged.length - 1].role === msg.role) {
      merged[merged.length - 1] = {
        role: msg.role,
        content: merged[merged.length - 1].content + "\n" + msg.content,
      };
    } else {
      merged.push({ ...msg });
    }
  }
  // Drop leading assistant messages — Anthropic requires first message to be user
  while (merged.length > 0 && merged[0].role === "assistant") {
    merged.shift();
  }
  return merged.map((m) => ({ role: m.role, content: m.content }));
}

export async function POST(request: Request) {
  const body = await request.json();
  const { conditionId, questionIndex, turnIndex = 0, history } = body;

  if (
    typeof conditionId !== "string" ||
    typeof questionIndex !== "number" ||
    !Array.isArray(history)
  ) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const systemPrompt = buildSystemPrompt(conditionId, questionIndex, turnIndex);
  const messages = normalizeHistory(history as ChatMessage[]);

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ ok: false, error: "history must end with user message" }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 300,
    system: systemPrompt,
    messages,
  });

  const rawText = response.content[0].type === "text" ? response.content[0].text.trim() : "";

  // Parse the JSON response the AI was instructed to return
  let responseText = rawText;
  let hasFollowUp = false;
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.text === "string") {
        responseText = parsed.text;
        hasFollowUp = !!parsed.followUp;
      }
    } catch {}
  }

  return NextResponse.json({ ok: true, response: responseText, hasFollowUp });
}
