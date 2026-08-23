"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PILOT2_ADVISORS } from "@/lib/config";

type Msg = { advisorSlot: number; role: string; text: string; ts: number };
type PData = {
  phase: string;
  slot: number | null;
  advisor: { name: string; avatar: string } | null;
  messages: Msg[];
  operatorTyping?: boolean;
};

export default function ParticipantSessionPage() {
  const params = useParams();
  const code = (params?.code as string) || "";

  const [data, setData] = useState<PData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  // 辨別任務（phase = postchat）本地狀態
  const [postStep, setPostStep] = useState<"open" | "choose">("open");
  const [postOpen, setPostOpen] = useState("");
  const [guess, setGuess] = useState<1 | 2 | null>(null);
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [postDone, setPostDone] = useState(false);
  const [postError, setPostError] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastKeyWasEnter = useRef(false);

  useEffect(() => {
    if (!code) return;
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/pilot2/session?code=${code}&role=participant`);
        if (res.status === 404) {
          if (active) setNotFound(true);
          return;
        }
        const j = await res.json();
        if (active && j.ok) setData(j);
      } catch {}
    };
    tick();
    const id = setInterval(tick, 1500);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [code]);

  const phase = data?.phase;
  const messages = data?.messages || [];
  const last = messages[messages.length - 1];
  const inConv = phase === "conv1" || phase === "conv2";
  const canType = !!(inConv && last && last.role === "agent" && !sending);
  // 打字中動畫跟著研究者實際打字狀態顯示（而非只看回合）
  const waiting = !!(inConv && data?.operatorTyping);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, phase, waiting]);

  useEffect(() => {
    if (canType) setTimeout(() => inputRef.current?.focus(), 100);
  }, [canType]);

  const send = async () => {
    const t = input.trim();
    if (!t || !canType) return;
    setSending(true);
    setInput("");
    try {
      await fetch("/api/pilot2/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, from: "participant", text: t }),
      });
    } catch {}
    setSending(false);
  };

  const submitResult = async () => {
    if (guess == null || postSubmitting) return;
    setPostSubmitting(true);
    setPostError(false);
    try {
      const res = await fetch("/api/pilot2/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, openAnswer: postOpen, guessSlot: guess }),
      });
      if (!res.ok) throw new Error();
      setPostDone(true);
    } catch {
      setPostError(true);
      setPostSubmitting(false);
    }
  };

  // 與前導一一致：連按兩次 Enter 才送出（Shift+Enter 換行）
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (lastKeyWasEnter.current) {
        lastKeyWasEnter.current = false;
        send();
      } else {
        lastKeyWasEnter.current = true;
      }
    } else {
      lastKeyWasEnter.current = false;
    }
  };

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-center text-sm text-gray-500">
        找不到此場次，請向研究者確認連結是否正確。
      </div>
    );
  }

  if (!data) {
    return <div className="flex min-h-screen items-center justify-center text-gray-400">載入中⋯⋯</div>;
  }

  // 完成：已送出辨別任務
  if (postDone || phase === "done") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-3 rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">感謝你的參與！</h1>
          <p className="text-sm text-gray-500">本次對話與問題已完成，你可以關閉此頁面。</p>
        </div>
      </div>
    );
  }

  // 辨別任務：兩段對話結束（postchat）後，由受試者自行作答
  if (phase === "postchat") {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-xl space-y-6">
          <p className="text-sm text-gray-500">對話結束了，最後想請你回答兩個問題。</p>

          {postStep === "open" && (
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                1. 你認為這兩位顧問（陳顧問、林顧問）有什麼不同？
              </p>
              <textarea
                value={postOpen}
                onChange={(e) => setPostOpen(e.target.value)}
                rows={5}
                placeholder="請輸入你的想法⋯⋯"
                className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-300 focus:outline-none"
              />
              <button
                onClick={() => setPostStep("choose")}
                disabled={postOpen.trim().length === 0}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300"
              >
                下一題
              </button>
            </div>
          )}

          {postStep === "choose" && (
            <div className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-gray-700">
                2. 兩位顧問中，有一位的回應並非由真人產生，你認為是哪一位？
              </p>
              <div className="space-y-3">
                {PILOT2_ADVISORS.map((a) => (
                  <button
                    key={a.slot}
                    onClick={() => setGuess(a.slot as 1 | 2)}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      guess === a.slot
                        ? "border-blue-400 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
              {postError && (
                <p className="text-center text-sm text-red-500">提交失敗，請檢查網路後再試一次。</p>
              )}
              <button
                onClick={submitResult}
                disabled={guess == null || postSubmitting}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:bg-gray-300"
              >
                {postSubmitting ? "提交中⋯⋯" : "提交"}
              </button>
              <button
                onClick={() => setPostStep("open")}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600"
              >
                返回上一題
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 等待 / 過場
  if (!inConv) {
    const text =
      phase === "waiting"
        ? "正在等待顧問上線⋯"
        : "第一段對話結束，準備與下一位顧問對話⋯";
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex justify-center gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "150ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "300ms" }} />
          </div>
          <p className="text-sm text-gray-500">{text}</p>
        </div>
      </div>
    );
  }

  // 對話介面
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* 頂部欄：顧問身分 */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        {data.advisor && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.advisor.avatar}
              alt={data.advisor.name}
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
            <p className="font-medium text-gray-800">{data.advisor.name}</p>
          </>
        )}
      </div>

      {/* 訊息區 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-blue-500 text-white" : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {waiting && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 輸入區 */}
      <div className="border-t bg-white px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={canType ? "輸入你的回答⋯⋯（按兩次 Enter 送出）" : "請稍候⋯⋯"}
            disabled={!canType}
            rows={1}
            className="max-h-40 flex-1 resize-none overflow-y-auto rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
          />
          <button
            onClick={send}
            disabled={!input.trim() || !canType}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}
