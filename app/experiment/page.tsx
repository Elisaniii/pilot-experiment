"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import {
  CONDITIONS,
  PILOT_QUESTIONS,
  MOCK_RESPONSES,
  type Condition,
} from "@/lib/config";

interface Message {
  role: "agent" | "user";
  text: string;
}

function ExperimentContent() {
  const params = useSearchParams();
  const router = useRouter();
  const conditionId = params.get("condition") || "human-high";
  const condition: Condition = CONDITIONS[conditionId] || CONDITIONS["human-high"];
  const isHuman = condition.agent === "human";
  const school = params.get("school") || "OO大學";

  const [phase, setPhase] = useState<"instruction" | "connecting" | "chat" | "done">("instruction");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [canType, setCanType] = useState(false);
  const [greetingDone, setGreetingDone] = useState(false);
  const [connectingStep, setConnectingStep] = useState(0);

  // 真人組專用：模擬連線過程的階段文字
  const connectingSteps = [
    "正在建立連線⋯",
    `正在等待 ${condition.agentName} 上線⋯`,
    "已連線",
  ];

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastKeyWasEnter = useRef(false);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  // 真人組：依字數模擬打字時間（含隨機停頓），AI 組固定短延遲
  const simulateTyping = useCallback(
    (text: string, onDone: () => void) => {
      setTyping(true);
      setCanType(false);

      if (isHuman) {
        // 字數越多打越久：約 60ms/字，最短 2.5s，最長 9s
        const baseDelay = Math.min(Math.max(text.length * 60, 2500), 9000);
        const totalDelay = baseDelay + Math.random() * 800;

        // 30% 無停頓、50% 一次停頓、20% 兩次停頓
        const pauseCount = Math.random() < 0.3 ? 0 : Math.random() < 0.7 ? 1 : 2;
        let cumulativePause = 0;

        for (let i = 0; i < pauseCount; i++) {
          const pauseAt = (Math.random() * 0.6 + 0.1) * totalDelay + cumulativePause;
          const pauseDuration = 700 + Math.random() * 800;
          setTimeout(() => setTyping(false), pauseAt);
          setTimeout(() => setTyping(true), pauseAt + pauseDuration);
          cumulativePause += pauseDuration;
        }

        setTimeout(() => {
          setTyping(false);
          onDone();
        }, totalDelay + cumulativePause);
      } else {
        // AI：固定 1–2 秒
        setTimeout(() => {
          setTyping(false);
          onDone();
        }, 1000 + Math.random() * 1000);
      }
    },
    [isHuman]
  );

  const addAgentMessage = useCallback(
    (text: string, onDone?: () => void) => {
      simulateTyping(text, () => {
        setMessages((prev) => [...prev, { role: "agent", text }]);
        setCanType(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        onDone?.();
      });
    },
    [simulateTyping]
  );

  // 依序送出一連串訊息（多個對話框），用於開場白或拆成多則的回應
  // 不用 useCallback：函式會遞迴呼叫自己，包成 useCallback 在新版 eslint-plugin-react-hooks 下會被判定為提前存取
  function sendMessageSequence(texts: string[], index: number, onDone: () => void) {
    if (index >= texts.length) {
      onDone();
      return;
    }
    const text = texts[index].replace("{school}", school);
    simulateTyping(text, () => {
      setMessages((prev) => [...prev, { role: "agent", text }]);
      if (index < texts.length - 1) {
        setTimeout(() => sendMessageSequence(texts, index + 1, onDone), 800);
      } else {
        onDone();
      }
    });
  }

  // 依序送出多個對話框，結束後開放受試者輸入
  const addAgentMessages = useCallback(
    (texts: string[], onDone?: () => void) => {
      sendMessageSequence(texts, 0, () => {
        setCanType(true);
        setTimeout(() => inputRef.current?.focus(), 100);
        onDone?.();
      });
    },
    [sendMessageSequence]
  );

  // 依序送開場訊息，最後等受試者確認基本資料
  const beginChat = useCallback(() => {
    setPhase("chat");
    sendMessageSequence(condition.greetings, 0, () => {
      setCanType(true);
      setTimeout(() => inputRef.current?.focus(), 100);
    });
  }, [sendMessageSequence, condition.greetings]);

  // 開始對話：真人組先跑連線等待動畫，AI 組直接進入對話
  const startChat = () => {
    if (!isHuman) {
      beginChat();
      return;
    }

    setPhase("connecting");
    setConnectingStep(0);

    const stepDurations = [1300, 1900, 900];
    let cumulative = 0;
    stepDurations.forEach((duration, i) => {
      if (i === 0) return;
      cumulative += stepDurations[i - 1];
      setTimeout(() => setConnectingStep(i), cumulative);
    });
    const totalDelay = stepDurations.reduce((a, b) => a + b, 0);
    setTimeout(beginChat, totalDelay);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || typing || !canType) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    // 確認基本資料後，送確認回應再開始第一題
    if (!greetingDone) {
      setGreetingDone(true);
      setTimeout(() => {
        addAgentMessages(condition.confirmationResponse || ["好的，那我們開始吧！"], () => {
          setTimeout(() => addAgentMessage(PILOT_QUESTIONS[0]), 800);
        });
      }, 500);
      return;
    }

    const responses = MOCK_RESPONSES[conditionId] || MOCK_RESPONSES["ai-high"];
    const currentQ = questionIndex;

    setTimeout(() => {
      addAgentMessages(responses[currentQ], () => {
        if (currentQ < PILOT_QUESTIONS.length - 1) {
          const nextQ = currentQ + 1;
          setTimeout(() => {
            addAgentMessage(PILOT_QUESTIONS[nextQ], () => {
              setQuestionIndex(nextQ);
            });
          }, 1200);
        } else {
          setTimeout(() => {
            router.push(`/survey?condition=${conditionId}`);
          }, 2500);
        }
      });
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (lastKeyWasEnter.current) {
        lastKeyWasEnter.current = false;
        handleSend();
      } else {
        lastKeyWasEnter.current = true;
      }
    } else {
      lastKeyWasEnter.current = false;
    }
  };

  // 指導語頁面
  if (phase === "instruction") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 shadow-sm">
          <div className="text-center">
            {condition.agentAvatar.startsWith("/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={condition.agentAvatar}
                alt={condition.agentName}
                width={80}
                height={80}
                className="mx-auto rounded-full object-cover"
              />
            ) : (
              <span className="text-4xl">{condition.agentAvatar}</span>
            )}
            <h2 className="mt-3 text-lg font-semibold text-gray-800">
              {condition.agentName}
            </h2>
          </div>
          <div className="rounded-xl bg-gray-50 p-5 text-sm leading-relaxed text-gray-600">
            {condition.instruction}
          </div>
          <button
            onClick={startChat}
            className="w-full rounded-xl bg-blue-600 py-3 text-white font-medium transition hover:bg-blue-700"
          >
            開始對話
          </button>
        </div>
      </div>
    );
  }

  // 連線等待頁面（真人組專用）
  if (phase === "connecting") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-lg space-y-6 rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="relative mx-auto h-20 w-20">
            <span className="absolute inset-0 animate-ping rounded-full bg-blue-200 opacity-75" />
            {condition.agentAvatar.startsWith("/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={condition.agentAvatar}
                alt={condition.agentName}
                width={80}
                height={80}
                className="relative h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <span className="relative flex h-20 w-20 items-center justify-center text-4xl">
                {condition.agentAvatar}
              </span>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">{connectingSteps[connectingStep]}</p>
            <div className="mt-3 flex justify-center gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 對話介面
  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* 頂部欄 */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3">
        {condition.agentAvatar.startsWith("/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={condition.agentAvatar}
            alt={condition.agentName}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <span className="text-2xl">{condition.agentAvatar}</span>
        )}
        <div>
          <p className="font-medium text-gray-800">{condition.agentName}</p>
        </div>
      </div>

      {/* 訊息區 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {typing && (
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
            disabled={!canType || typing}
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-blue-300 focus:outline-none disabled:bg-gray-50 disabled:text-gray-400 max-h-40 overflow-y-auto"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || !canType || typing}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm text-white transition hover:bg-blue-700 disabled:bg-gray-300"
          >
            送出
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ExperimentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-gray-400">載入中⋯⋯</div>}>
      <ExperimentContent />
    </Suspense>
  );
}
