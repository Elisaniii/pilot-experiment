"use client";
import { useEffect, useRef, useState } from "react";
import { PILOT2_ADVISORS, PILOT2_QUESTIONS_A, PILOT2_QUESTIONS_B } from "@/lib/config";

type Msg = { advisorSlot: number; role: string; text: string; ts: number };
type SessionData = { phase: string; advisorOrder: string[]; messages: Msg[] };

const NEXT_PHASE: Record<string, { to: string; label: string } | null> = {
  waiting: { to: "conv1", label: "開始第一段對話（陳顧問）" },
  conv1: { to: "transition", label: "結束第一段，進入過場" },
  transition: { to: "conv2", label: "開始第二段對話（林顧問）" },
  conv2: { to: "postchat", label: "結束對話" },
  postchat: null,
  done: null,
};

export default function OperatorPage() {
  const [code, setCode] = useState<string | null>(null);
  const [data, setData] = useState<SessionData | null>(null);
  const [input, setInput] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const createSession = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/pilot2/session", { method: "POST" });
      const j = await res.json();
      if (j.ok) setCode(j.code);
    } catch {}
    setCreating(false);
  };

  useEffect(() => {
    if (!code) return;
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/pilot2/session?code=${code}&role=operator`);
        const j = await res.json();
        if (active && j.ok) setData({ phase: j.phase, advisorOrder: j.advisorOrder, messages: j.messages || [] });
      } catch {}
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [code]);

  const phase = data?.phase ?? "waiting";
  const slot = phase === "conv1" ? 1 : phase === "conv2" ? 2 : null;
  const currentType = slot && data ? data.advisorOrder[slot - 1] : null; // human | llm
  const advisor = slot ? PILOT2_ADVISORS[slot - 1] : null;
  const questions = slot === 1 ? PILOT2_QUESTIONS_A : slot === 2 ? PILOT2_QUESTIONS_B : [];
  const slotMessages = data ? data.messages.filter((m) => (slot ? m.advisorSlot === slot : false)) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [slotMessages.length]);

  const setPhase = async (to: string) => {
    if (!code) return;
    await fetch("/api/pilot2/phase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, phase: to }),
    });
  };

  const send = async () => {
    const t = input.trim();
    if (!t || !code || !slot) return;
    setInput("");
    await fetch("/api/pilot2/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, from: "operator", text: t }),
    });
  };

  const genDraft = async () => {
    if (!code) return;
    setDrafting(true);
    try {
      const res = await fetch("/api/pilot2/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const j = await res.json();
      if (j.ok) setInput(j.draft);
    } catch {}
    setDrafting(false);
  };

  const participantUrl = code && typeof window !== "undefined" ? `${window.location.origin}/pilot2/s/${code}` : "";
  const copyUrl = () => {
    navigator.clipboard?.writeText(participantUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // ── 尚未建立場次 ──
  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">前導二・研究者操作台</h1>
            <p className="mt-2 text-sm text-gray-500">建立一個新場次，並把連結分享給受試者</p>
          </div>
          <button
            onClick={createSession}
            disabled={creating}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-medium transition hover:bg-blue-700 disabled:opacity-40"
          >
            {creating ? "建立中⋯" : "建立新場次"}
          </button>
        </div>
      </div>
    );
  }

  const nextPhase = NEXT_PHASE[phase];

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* 頂部：場次資訊與流程控制 */}
      <div className="border-b bg-white px-4 py-3">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-semibold text-gray-800">場次 {code}</span>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={participantUrl}
                className="w-72 max-w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-600"
              />
              <button onClick={copyUrl} className="rounded-lg bg-gray-100 px-3 py-1 text-xs text-gray-700 hover:bg-gray-200">
                {copied ? "已複製" : "複製連結"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              目前階段：
              {phase === "waiting" && "尚未開始"}
              {phase === "conv1" && "第一段・陳顧問"}
              {phase === "transition" && "過場"}
              {phase === "conv2" && "第二段・林顧問"}
              {phase === "postchat" && "對話結束"}
              {phase === "done" && "完成"}
            </span>
            {slot && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  currentType === "human" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                }`}
              >
                {advisor?.name}　你的角色：{currentType === "human" ? "真人（自己打字回覆）" : "AI（用草稿審閱後送出）"}
              </span>
            )}
            {nextPhase && (
              <button
                onClick={() => setPhase(nextPhase.to)}
                className="ml-auto rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
              >
                {nextPhase.label}
              </button>
            )}
            {phase === "postchat" && (
              <span className="ml-auto text-xs text-gray-400">辨別任務為階段二，稍後建置</span>
            )}
          </div>
        </div>
      </div>

      {/* 中段：題目提示 + 對話 */}
      <div className="mx-auto flex w-full max-w-4xl flex-1 gap-4 overflow-hidden px-4 py-4">
        {/* 題目提示 */}
        {slot && (
          <div className="hidden w-64 shrink-0 overflow-y-auto rounded-xl border border-gray-200 bg-white p-4 md:block">
            <p className="mb-2 text-xs font-semibold text-gray-500">本段訪談題目（提示）</p>
            <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-gray-600">
              {questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ol>
          </div>
        )}

        {/* 對話區 */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {!slot && (
              <p className="mt-10 text-center text-sm text-gray-400">
                {phase === "waiting" && "按上方「開始第一段對話」後即可開始"}
                {phase === "transition" && "過場中，按「開始第二段對話」繼續"}
                {(phase === "postchat" || phase === "done") && "對話已結束"}
              </p>
            )}
            {slotMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "agent" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "agent" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* 輸入區 */}
          {slot && (
            <div className="border-t px-4 py-3">
              {currentType === "llm" && (
                <div className="mb-2">
                  <button
                    onClick={genDraft}
                    disabled={drafting}
                    className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                  >
                    {drafting ? "生成中⋯" : "AI 生成草稿"}
                  </button>
                  <span className="ml-2 text-xs text-gray-400">生成後可編輯再送出</span>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    e.target.style.height = "auto";
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={2}
                  placeholder={currentType === "human" ? "以真人顧問身分打字回覆⋯（⌘/Ctrl+Enter 送出）" : "審閱／編輯草稿後送出⋯（⌘/Ctrl+Enter 送出）"}
                  className="max-h-40 flex-1 resize-none overflow-y-auto rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:bg-gray-300"
                >
                  送出
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
