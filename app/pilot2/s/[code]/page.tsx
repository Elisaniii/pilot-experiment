"use client";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Msg = { advisorSlot: number; role: string; text: string; ts: number };
type PData = {
  phase: string;
  slot: number | null;
  advisor: { name: string; avatar: string } | null;
  messages: Msg[];
};

export default function ParticipantSessionPage() {
  const params = useParams();
  const code = (params?.code as string) || "";

  const [data, setData] = useState<PData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  const waiting = !!(inConv && (!last || last.role === "user"));

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

  // 等待 / 過場 / 結束等非對話階段
  if (!inConv) {
    let text = "";
    if (phase === "waiting") text = "正在等待顧問上線⋯";
    else if (phase === "transition") text = "第一段對話結束，準備與下一位顧問對話⋯";
    else text = "對話結束，請稍候⋯";
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
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={canType ? "輸入你的回答⋯⋯（Enter 送出）" : "請稍候⋯⋯"}
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
