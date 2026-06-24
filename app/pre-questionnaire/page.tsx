"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";

const DIMENSIONS = [
  {
    title: "愚鈍懦弱 ↔ 精明幹練",
    pairs: [
      { l: "愚鈍的", r: "精明的" },
      { l: "無能的", r: "能幹的" },
      { l: "遲鈍的", r: "機智的" },
      { l: "笨拙的", r: "聰明的" },
      { l: "木訥的", r: "靈活的" },
      { l: "懦弱的", r: "果敢的" },
      { l: "猶豫的", r: "果斷的" },
      { l: "沒主見的", r: "有主見的" },
      { l: "無才幹的", r: "有才幹的" },
      { l: "反應遲緩的", r: "反應敏捷的" },
      { l: "短視的", r: "有見識的" },
      { l: "糊塗的", r: "明智的" },
      { l: "沒魄力的", r: "有魄力的" },
      { l: "笨手笨腳的", r: "幹練的" },
    ],
  },
  {
    title: "懶散放縱 ↔ 勤儉恆毅",
    pairs: [
      { l: "懶惰的", r: "勤勞的" },
      { l: "怠惰的", r: "敬業的" },
      { l: "散漫的", r: "自律的" },
      { l: "偷懶的", r: "努力的" },
      { l: "馬虎的", r: "認真的" },
      { l: "粗心的", r: "細心的" },
      { l: "草率的", r: "謹慎的" },
      { l: "半途而廢的", r: "持之以恆的" },
      { l: "揮霍的", r: "節儉的" },
      { l: "不守紀律的", r: "守紀律的" },
      { l: "拖延的", r: "守時的" },
      { l: "隨便的", r: "嚴謹的" },
      { l: "敷衍了事的", r: "一絲不苟的" },
      { l: "三分鐘熱度的", r: "有恆心的" },
    ],
  },
  {
    title: "暴躁倔強 ↔ 溫順隨和",
    pairs: [
      { l: "暴躁的", r: "溫和的" },
      { l: "倔強的", r: "隨和的" },
      { l: "強硬的", r: "柔順的" },
      { l: "易怒的", r: "平和的" },
      { l: "苛刻的", r: "體諒的" },
      { l: "冷漠的", r: "親切的" },
      { l: "兇惡的", r: "和善的" },
      { l: "粗暴的", r: "溫柔的" },
      { l: "固執的", r: "圓融的" },
      { l: "難相處的", r: "好相處的" },
      { l: "蠻不講理的", r: "通情達理的" },
      { l: "火氣大的", r: "心平氣和的" },
      { l: "反抗的", r: "順從的" },
      { l: "排斥的", r: "包容的" },
    ],
  },
  {
    title: "狡詐卑鄙 ↔ 誠信淡泊",
    pairs: [
      { l: "虛偽的", r: "誠實的" },
      { l: "狡詐的", r: "正直的" },
      { l: "失信的", r: "守信的" },
      { l: "奸詐的", r: "老實的" },
      { l: "貪婪的", r: "廉潔的" },
      { l: "功利的", r: "淡泊的" },
      { l: "貪心的", r: "知足的" },
      { l: "虛榮的", r: "樸實的" },
      { l: "殘酷的", r: "仁慈的" },
      { l: "邪惡的", r: "善良的" },
      { l: "刻薄的", r: "厚道的" },
      { l: "沒道義的", r: "講道義的" },
      { l: "偏私的", r: "公正的" },
      { l: "卑鄙的", r: "高尚的" },
    ],
  },
  {
    title: "內向沉靜 ↔ 外向活躍",
    pairs: [
      { l: "內向的", r: "外向的" },
      { l: "文靜的", r: "活潑的" },
      { l: "沉鬱的", r: "開朗的" },
      { l: "沉默的", r: "健談的" },
      { l: "寡言的", r: "多話的" },
      { l: "被動的", r: "主動的" },
      { l: "不愛交際的", r: "愛交際的" },
      { l: "喜歡獨處的", r: "喜歡熱鬧的" },
      { l: "不善社交的", r: "善於社交的" },
      { l: "內斂的", r: "開放的" },
      { l: "拘謹的", r: "大方的" },
      { l: "沉靜的", r: "喧鬧的" },
      { l: "不愛出風頭的", r: "喜歡表現的" },
      { l: "靜默的", r: "充滿活力的" },
    ],
  },
  {
    title: "計較自私 ↔ 豪邁直爽",
    pairs: [
      { l: "計較的", r: "豪邁的" },
      { l: "吝嗇的", r: "慷慨的" },
      { l: "心機重的", r: "直爽的" },
      { l: "小心眼的", r: "海派的" },
      { l: "小氣的", r: "大器的" },
      { l: "斤斤計較的", r: "不拘小節的" },
      { l: "自私自利的", r: "講義氣的" },
      { l: "偏私的", r: "仗義的" },
      { l: "算計的", r: "灑脫的" },
      { l: "狹隘的", r: "豁達的" },
      { l: "推託的", r: "爽快的" },
      { l: "摳門的", r: "闊氣的" },
      { l: "一毛不拔的", r: "樂善好施的" },
      { l: "心胸狹窄的", r: "心胸寬大的" },
    ],
  },
  {
    title: "悲觀善感 ↔ 樂觀自在",
    pairs: [
      { l: "悲觀的", r: "樂觀的" },
      { l: "憂鬱的", r: "愉快的" },
      { l: "緊張的", r: "自在的" },
      { l: "焦慮的", r: "放鬆的" },
      { l: "慌張的", r: "沉著的" },
      { l: "易激動的", r: "冷靜的" },
      { l: "多愁善感的", r: "情緒穩定的" },
      { l: "心情起伏的", r: "心情平和的" },
      { l: "不安的", r: "安心的" },
      { l: "憂心的", r: "坦然的" },
      { l: "慌亂的", r: "鎮定的" },
      { l: "憂心忡忡的", r: "無憂無慮的" },
      { l: "自卑的", r: "自信的" },
      { l: "苦悶的", r: "開心的" },
    ],
  },
];

const REQUIRED = 10;

type Answers = Record<number, number>[];

function getSelectedCount(answers: Answers) {
  return answers.reduce((sum, dim) => sum + Object.keys(dim).length, 0);
}

function ProgressDots({ activeStep }: { activeStep: number }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
      {DIMENSIONS.map((_, i) => {
        const isDone = i < activeStep;
        const isActive = i === activeStep;
        return (
          <span
            key={i}
            style={{
              width: isActive ? 20 : 8,
              height: 8,
              borderRadius: isActive ? 4 : "50%",
              backgroundColor: isDone ? "#b8c49a" : isActive ? "#CCD5AE" : "#e5e5e5",
              transition: "background-color 0.2s, width 0.2s",
              flexShrink: 0,
            }}
          />
        );
      })}
    </div>
  );
}

function InstructionStep({ onNext }: { onNext: () => void }) {
  return (
    <>
      <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, letterSpacing: "0.5px" }}>
        人格特質量表
      </p>
      <h1 style={{ fontSize: 20, color: "#222", marginBottom: 20 }}>填寫說明</h1>
      <div style={{ fontSize: 14, color: "#555", lineHeight: 1.9, marginBottom: 32 }}>
        <p style={{ margin: "0 0 10px" }}>接下來共有七個向度、98 個形容詞對。</p>
        <p style={{ margin: "0 0 10px" }}>
          請從中選出 <strong style={{ color: "#3a3a3a" }}>10 個</strong>{" "}
          您認為最能描述自己的形容詞對，並在每對之間選擇最符合您的位置。
        </p>
        <p style={{ margin: 0 }}>各向度可選擇的數量不限，但合計須恰好選出 10 個，才能送出。</p>
      </div>
      <button
        onClick={onNext}
        style={{
          width: "100%",
          padding: "13px 0",
          border: "none",
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          backgroundColor: "#CCD5AE",
          color: "#3a3a3a",
        }}
      >
        開始填寫
      </button>
    </>
  );
}

function DimensionStep({
  dimIdx,
  answers,
  onAnswer,
  onPrev,
  onNext,
}: {
  dimIdx: number;
  answers: Answers;
  onAnswer: (dimIdx: number, pairIdx: number, val: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const dim = DIMENSIONS[dimIdx];
  const count = getSelectedCount(answers);
  const isLast = dimIdx === DIMENSIONS.length - 1;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 12, color: "#aaa", margin: 0, letterSpacing: "0.5px" }}>
          人格特質量表・第 {dimIdx + 1} / 7 向度
        </p>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: count >= REQUIRED ? "#5a7a3a" : "#aaa",
            background: count >= REQUIRED ? "#e8f0d8" : "#f5f5f5",
            borderRadius: 20,
            padding: "4px 12px",
            whiteSpace: "nowrap",
            transition: "background-color 0.2s, color 0.2s",
          }}
        >
          {count} / {REQUIRED}
        </span>
      </div>

      <ProgressDots activeStep={dimIdx} />

      <h1 style={{ textAlign: "center", fontSize: 20, color: "#222", margin: "0 0 24px" }}>
        {dim.title}
      </h1>

      <div style={{ marginBottom: 28 }}>
        {dim.pairs.map((pair, pIdx) => {
          const rating = answers[dimIdx][pIdx];
          const hasRating = rating !== undefined;
          const locked = !hasRating && count >= REQUIRED;

          return (
            <div
              key={pIdx}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                alignItems: "center",
                columnGap: 10,
                padding: "10px 14px",
                borderRadius: 8,
                marginBottom: 8,
                border: `1.5px solid ${hasRating ? "#c8d8a8" : "#e8e8e8"}`,
                backgroundColor: hasRating ? "#f5f8ee" : "transparent",
                transition: "background-color 0.15s, border-color 0.15s",
              }}
            >
              <span style={{ fontSize: 13, color: "#333", wordBreak: "keep-all", textAlign: "left" }}>
                {pair.l}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {([-2, -1, 0, 1, 2] as const).map((v) => {
                  const isSelected = rating === v;
                  return (
                    <button
                      key={v}
                      disabled={locked && !isSelected}
                      onClick={() => onAnswer(dimIdx, pIdx, v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: `1.5px solid ${
                          isSelected ? "#a4b386" : locked ? "#ebebeb" : "#ddd"
                        }`,
                        background: isSelected ? "#CCD5AE" : locked ? "#fafafa" : "#fff",
                        color: isSelected ? "#3a3a3a" : locked ? "#ddd" : "#bbb",
                        cursor: locked ? "default" : "pointer",
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 600,
                        transition: "border-color 0.15s, background-color 0.15s",
                      }}
                    >
                      {Math.abs(v)}
                    </button>
                  );
                })}
              </div>
              <span style={{ fontSize: 13, color: "#333", wordBreak: "keep-all", textAlign: "right" }}>
                {pair.r}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onPrev}
          style={{
            flex: 1,
            padding: "13px 0",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: "#f0f0f0",
            color: "#777",
          }}
        >
          {dimIdx === 0 ? "填寫說明" : "上一頁"}
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 2,
            padding: "13px 0",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: "#CCD5AE",
            color: "#3a3a3a",
          }}
        >
          {isLast ? "前往確認" : "下一頁"}
        </button>
      </div>
    </>
  );
}

function ConfirmationStep({
  answers,
  onPrev,
  onSubmit,
}: {
  answers: Answers;
  onPrev: () => void;
  onSubmit: () => void;
}) {
  const count = getSelectedCount(answers);
  const ready = count === REQUIRED;

  return (
    <>
      <p style={{ fontSize: 12, color: "#aaa", marginBottom: 14, letterSpacing: "0.5px" }}>
        人格特質量表
      </p>
      <ProgressDots activeStep={DIMENSIONS.length} />
      <h1 style={{ fontSize: 20, color: "#222", marginBottom: 16 }}>確認送出</h1>
      <p style={{ fontSize: 14, color: "#555", lineHeight: 1.8, marginBottom: 16 }}>
        請確認已完成所有填寫，送出後將無法修改。
      </p>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          padding: "12px 16px",
          borderRadius: 8,
          marginBottom: 28,
          backgroundColor: ready ? "#f0f5e8" : "#fff0f0",
          color: ready ? "#5a7a3a" : "#c0392b",
        }}
      >
        {ready
          ? `已完成 ${REQUIRED} 個詞對的填寫，可以送出。`
          : `已填寫 ${count} / ${REQUIRED} 個詞對，請返回補足剩餘 ${REQUIRED - count} 個。`}
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <button
          onClick={onPrev}
          style={{
            flex: 1,
            padding: "13px 0",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            backgroundColor: "#f0f0f0",
            color: "#777",
          }}
        >
          返回修改
        </button>
        <button
          onClick={onSubmit}
          disabled={!ready}
          style={{
            flex: 2,
            padding: "13px 0",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: ready ? "pointer" : "default",
            backgroundColor: ready ? "#CCD5AE" : "#e5e5e5",
            color: ready ? "#3a3a3a" : "#aaa",
          }}
        >
          確認送出
        </button>
      </div>
    </>
  );
}

function PreQuestionnaireContent() {
  const params = useSearchParams();
  const router = useRouter();
  const condition = params.get("condition") || "human-high";
  const school = params.get("school") || "";

  // -1: instruction, 0-6: dimensions, 7: confirmation
  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<Answers>(DIMENSIONS.map(() => ({})));

  const handleAnswer = (dimIdx: number, pairIdx: number, val: number) => {
    setAnswers((prev) => {
      const next = prev.map((d) => ({ ...d }));
      if (next[dimIdx][pairIdx] === val) {
        delete next[dimIdx][pairIdx];
      } else {
        const total = getSelectedCount(next);
        const alreadySelected = next[dimIdx][pairIdx] !== undefined;
        if (alreadySelected || total < REQUIRED) {
          next[dimIdx][pairIdx] = val;
        }
      }
      return next;
    });
  };

  const scrollTop = () => window.scrollTo(0, 0);

  const goNext = () => {
    setStep((s) => s + 1);
    scrollTop();
  };
  const goPrev = () => {
    setStep((s) => s - 1);
    scrollTop();
  };

  const handleSubmit = () => {
    sessionStorage.setItem("bipolarScale", JSON.stringify(answers));
    router.push(`/experiment?condition=${condition}&school=${encodeURIComponent(school)}`);
  };

  const containerStyle: React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 12,
    padding: "48px 40px",
    boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
    maxWidth: 520,
    width: "100%",
    fontFamily: '"Lucida Grande", Helvetica, Arial, sans-serif',
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        margin: 0,
        padding: "40px 20px",
        boxSizing: "border-box",
        backgroundColor: "#f9f9f9",
      }}
    >
      <div style={containerStyle}>
        {step === -1 && <InstructionStep onNext={goNext} />}
        {step >= 0 && step < DIMENSIONS.length && (
          <DimensionStep
            dimIdx={step}
            answers={answers}
            onAnswer={handleAnswer}
            onPrev={goPrev}
            onNext={goNext}
          />
        )}
        {step === DIMENSIONS.length && (
          <ConfirmationStep answers={answers} onPrev={goPrev} onSubmit={handleSubmit} />
        )}
      </div>
    </div>
  );
}

export default function PreQuestionnairePage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", color: "#aaa" }}>載入中⋯⋯</div>}>
      <PreQuestionnaireContent />
    </Suspense>
  );
}
