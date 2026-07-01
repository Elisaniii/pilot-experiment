"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import styles from "./pre-questionnaire.module.css";

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

const S = {
  pageLabel: {
    fontSize: 12,
    color: "#aaa",
    margin: 0,
    letterSpacing: "0.5px",
  },
  stickyInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  navButtons: { display: "flex", gap: 12, marginTop: 24 },
  btnPrev: {
    flex: 1,
    padding: "13px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    backgroundColor: "#f0f0f0",
    color: "#777",
    fontFamily: '"Lucida Grande", Helvetica, Arial, sans-serif',
  },
  btnNext: (disabled: boolean) => ({
    flex: 2,
    padding: "13px 0",
    border: "none",
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: disabled ? "default" : "pointer",
    backgroundColor: disabled ? "#e5e5e5" : "#CCD5AE",
    color: disabled ? "#aaa" : "#3a3a3a",
    fontFamily: '"Lucida Grande", Helvetica, Arial, sans-serif',
  }),
};

function Counter({ count, total }: { count: number; total: number }) {
  const done = count >= total;
  return (
    <span
      style={{
        fontSize: 13,
        fontWeight: 600,
        color: done ? "#5a7a3a" : "#aaa",
        background: done ? "#e8f0d8" : "#f5f5f5",
        borderRadius: 20,
        padding: "4px 12px",
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
        transition: "background-color 0.2s, color 0.2s",
      }}
    >
      {count} / {total}
    </span>
  );
}

// ── 說明頁 ────────────────────────────────────────────────────────────────
function InstructionStep({ onNext }: { onNext: () => void }) {
  return (
    <>
      <p style={S.pageLabel}>人格特質量表</p>
      <h1 style={{ fontSize: 20, color: "#222", margin: "14px 0 20px" }}>填寫說明</h1>
      <div style={{ fontSize: 14, color: "#555", lineHeight: 1.9, marginBottom: 32 }}>
        <p style={{ margin: "0 0 10px" }}>接下來共有七個向度、98 個形容詞對，填寫分為兩個步驟：</p>
        <p style={{ margin: "0 0 6px" }}>
          <strong style={{ color: "#3a3a3a" }}>步驟一</strong>：瀏覽全部 98 個詞對，從中選出{" "}
          <strong style={{ color: "#3a3a3a" }}>10 個</strong>最能描述自己的詞對。
        </p>
        <p style={{ margin: "0 0 10px", color: "#888" }}>
          有可能是你覺得其中一個極端是最符合你的、有可能是你覺得兩個極端都是符合你的特質。
        </p>
        <p style={{ margin: "0 0 6px" }}>
          <strong style={{ color: "#3a3a3a" }}>步驟二</strong>：針對選出的 10 個詞對，在每對之間選擇最符合您的位置。
        </p>
        <p style={{ margin: 0, color: "#888" }}>
          評分標準為 1-5 分（例如：內向 ↔ 外向，1 = 非常偏內向，3 = 中間，5 = 非常偏外向）。
        </p>
      </div>
      <button onClick={onNext} style={{ ...S.btnNext(false), width: "100%" }}>
        開始填寫
      </button>
    </>
  );
}

// ── 選擇頁 ────────────────────────────────────────────────────────────────
function SelectionStep({
  selectedKeys,
  onToggle,
  onPrev,
  onNext,
}: {
  selectedKeys: Set<string>;
  onToggle: (key: string) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const count = selectedKeys.size;
  const canNext = count === REQUIRED;

  return (
    <>
      <div className={styles.stickyBar}>
        <div style={S.stickyInner}>
          <span style={S.pageLabel}>步驟 1 / 2・選擇詞對</span>
          <Counter count={count} total={REQUIRED} />
        </div>
        <p style={{ fontSize: 13, color: "#777", margin: 0, lineHeight: 1.5 }}>
          從 98 個詞對中，選出 <strong>10 個</strong>最能描述自己的詞對
        </p>
      </div>

      <div>
        {DIMENSIONS.map((dim, dIdx) => (
          <div key={dIdx} style={{ marginBottom: 4 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#bbb",
                letterSpacing: "0.5px",
                margin: dIdx === 0 ? "0 0 8px" : "24px 0 8px",
                paddingBottom: 6,
                borderBottom: "1px solid #f0f0f0",
              }}
            >
              {dim.title}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 8,
                marginBottom: 4,
              }}
            >
              {dim.pairs.map((pair, pIdx) => {
                const key = `${dIdx}-${pIdx}`;
                const isSelected = selectedKeys.has(key);
                const isLocked = !isSelected && count >= REQUIRED;
                return (
                  <div
                    key={pIdx}
                    onClick={() => !isLocked && onToggle(key)}
                    style={{
                      padding: "8px 6px",
                      borderRadius: 8,
                      border: `1.5px solid ${isSelected ? "#c8d8a8" : "#e8e8e8"}`,
                      background: isSelected ? "#f5f8ee" : "transparent",
                      cursor: isLocked ? "default" : "pointer",
                      textAlign: "center" as const,
                      userSelect: "none" as const,
                      opacity: isLocked ? 0.35 : 1,
                      transition: "background-color 0.15s, border-color 0.15s",
                    }}
                  >
                    <span style={{ fontSize: 12, color: "#333", lineHeight: 1.5 }}>
                      {pair.l}／{pair.r}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div style={S.navButtons}>
        <button onClick={onPrev} style={S.btnPrev}>填寫說明</button>
        <button onClick={onNext} disabled={!canNext} style={S.btnNext(!canNext)}>
          下一步：進行評分
        </button>
      </div>
    </>
  );
}

// ── 評分頁 ────────────────────────────────────────────────────────────────
function RatingStep({
  selectedKeys,
  ratings,
  onRate,
  onPrev,
  onNext,
}: {
  selectedKeys: Set<string>;
  ratings: Record<string, number>;
  onRate: (key: string, val: number) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const ratedCount = Object.keys(ratings).length;
  const canNext = ratedCount === REQUIRED;

  const sortedKeys = [...selectedKeys].sort((a, b) => {
    const [da, pa] = a.split("-").map(Number);
    const [db, pb] = b.split("-").map(Number);
    return da !== db ? da - db : pa - pb;
  });

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={S.pageLabel}>步驟 2 / 2・評分</p>
        <Counter count={ratedCount} total={REQUIRED} />
      </div>
      <h1 style={{ fontSize: 20, color: "#222", margin: "0 0 8px" }}>為選出的詞對評分</h1>
      <p style={{ fontSize: 13, color: "#777", margin: "0 0 24px", lineHeight: 1.7 }}>
        請在每個詞對中，選擇最符合您的位置（可點同一格取消）。
      </p>

      <div>
        {sortedKeys.map((key) => {
          const [dIdx, pIdx] = key.split("-").map(Number);
          const pair = DIMENSIONS[dIdx].pairs[pIdx];
          const rating = ratings[key];
          const hasRating = rating !== undefined;

          return (
            <div
              key={key}
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
              <span
                style={{
                  fontSize: "clamp(11px, 3.2vw, 14px)",
                  color: "#333",
                  wordBreak: "keep-all" as const,
                  textAlign: "left" as const,
                }}
              >
                {pair.l}
              </span>
              <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
                {([-2, -1, 0, 1, 2] as const).map((v) => {
                  const isSelected = rating === v;
                  return (
                    <span
                      key={v}
                      onClick={() => onRate(key, v)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        border: `1.5px solid ${isSelected ? "#a4b386" : "#ddd"}`,
                        background: isSelected ? "#CCD5AE" : "#fff",
                        color: isSelected ? "#3a3a3a" : "#bbb",
                        cursor: "pointer",
                        flexShrink: 0,
                        fontSize: 10,
                        fontWeight: 600,
                        transition: "border-color 0.15s, background-color 0.15s",
                        userSelect: "none" as const,
                      }}
                    >
                      {v + 3}
                    </span>
                  );
                })}
              </div>
              <span
                style={{
                  fontSize: "clamp(11px, 3.2vw, 14px)",
                  color: "#333",
                  wordBreak: "keep-all" as const,
                  textAlign: "right" as const,
                }}
              >
                {pair.r}
              </span>
            </div>
          );
        })}
      </div>

      <div style={S.navButtons}>
        <button onClick={onPrev} style={S.btnPrev}>返回選擇</button>
        <button onClick={onNext} disabled={!canNext} style={S.btnNext(!canNext)}>
          前往確認
        </button>
      </div>
    </>
  );
}

// ── 確認頁 ────────────────────────────────────────────────────────────────
function ConfirmationStep({
  ratings,
  submitting,
  submitError,
  onPrev,
  onSubmit,
}: {
  ratings: Record<string, number>;
  submitting: boolean;
  submitError: boolean;
  onPrev: () => void;
  onSubmit: () => void;
}) {
  const ratedCount = Object.keys(ratings).length;
  const ready = ratedCount === REQUIRED;

  return (
    <>
      <p style={S.pageLabel}>人格特質量表</p>
      <h1 style={{ fontSize: 20, color: "#222", margin: "14px 0 16px" }}>確認送出</h1>
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
          ? `已完成 ${REQUIRED} 個詞對的選擇與評分，可以送出。`
          : `尚有 ${REQUIRED - ratedCount} 個詞對未完成評分，請返回補足。`}
      </div>
      <div style={S.navButtons}>
        <button onClick={onPrev} style={S.btnPrev}>返回修改</button>
        <button
          onClick={onSubmit}
          disabled={!ready || submitting}
          style={S.btnNext(!ready || submitting)}
        >
          {submitting ? "送出中⋯⋯" : "確認送出"}
        </button>
      </div>
      {submitError && (
        <p style={{ marginTop: 12, fontSize: 13, color: "#c0392b", textAlign: "center" }}>
          送出失敗，請檢查網路連線後再試一次。
        </p>
      )}
    </>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────────────
function PreQuestionnaireContent() {
  const params = useSearchParams();
  const router = useRouter();
  const condition = params.get("condition") || "human-high";
  const school = params.get("school") || "";
  const participantId = params.get("pid") || "";

  // -1: 說明  0: 選擇  1: 評分  2: 確認
  const [step, setStep] = useState(-1);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const scrollTop = () => window.scrollTo(0, 0);

  const handleToggle = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
        setRatings((r) => { const n = { ...r }; delete n[key]; return n; });
      } else if (next.size < REQUIRED) {
        next.add(key);
      }
      return next;
    });
  };

  const handleRate = (key: string, val: number) => {
    setRatings((prev) => {
      const next = { ...prev };
      if (next[key] === val) delete next[key];
      else next[key] = val;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(false);

    const selections = [...selectedKeys]
      .sort((a, b) => {
        const [da, pa] = a.split("-").map(Number);
        const [db, pb] = b.split("-").map(Number);
        return da !== db ? da - db : pa - pb;
      })
      .map((key) => {
        const [dIdx, pIdx] = key.split("-").map(Number);
        return {
          dimension: DIMENSIONS[dIdx].title,
          left: DIMENSIONS[dIdx].pairs[pIdx].l,
          right: DIMENSIONS[dIdx].pairs[pIdx].r,
          rating: ratings[key],
        };
      });

    try {
      const res = await fetch("/api/pre-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participantId, condition, selections }),
      });
      if (!res.ok) throw new Error();
      router.push(`/experiment?condition=${condition}&school=${encodeURIComponent(school)}&pid=${participantId}`);
    } catch {
      setSubmitError(true);
      setSubmitting(false);
    }
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
      <div className={styles.container}>
        {step === -1 && (
          <InstructionStep onNext={() => { setStep(0); scrollTop(); }} />
        )}
        {step === 0 && (
          <SelectionStep
            selectedKeys={selectedKeys}
            onToggle={handleToggle}
            onPrev={() => { setStep(-1); scrollTop(); }}
            onNext={() => { setStep(1); scrollTop(); }}
          />
        )}
        {step === 1 && (
          <RatingStep
            selectedKeys={selectedKeys}
            ratings={ratings}
            onRate={handleRate}
            onPrev={() => { setStep(0); scrollTop(); }}
            onNext={() => { setStep(2); scrollTop(); }}
          />
        )}
        {step === 2 && (
          <ConfirmationStep
            ratings={ratings}
            submitting={submitting}
            submitError={submitError}
            onPrev={() => { setStep(1); scrollTop(); }}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default function PreQuestionnairePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            minHeight: "100vh",
            alignItems: "center",
            justifyContent: "center",
            color: "#aaa",
          }}
        >
          載入中⋯⋯
        </div>
      }
    >
      <PreQuestionnaireContent />
    </Suspense>
  );
}
