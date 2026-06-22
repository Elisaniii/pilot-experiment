// 實驗條件定義
export type AgentType = "human" | "ai";
export type EvalLevel = "high" | "low";

export interface Condition {
  id: string;
  agent: AgentType;
  eval: EvalLevel;
  label: string;
  agentName: string;
  agentAvatar: string; // emoji placeholder, 正式版換成圖片
  instruction: string;
  greetings: string[]; // 依序送出的開場訊息；{school}、{dept} 為動態佔位符
  confirmationResponse?: string[]; // 受試者確認基本資料後的回應，依序送出多個對話框
}

export const CONDITIONS: Record<string, Condition> = {
  "human-high": {
    id: "human-high",
    agent: "human",
    eval: "high",
    label: "真人 × 高評價",
    agentName: "戴文琴 顧問",
    agentAvatar: "/consultant.png",
    instruction:
      "這個研究是與職涯發展中心合作的計畫。你會與一位職涯顧問進行對談，顧問會根據你的回答，評估您在未來職場上的競爭力，產出一份個人競爭力評估報告，包含您的競爭力分數以及優缺點分析。",
    greetings: [
      "你好，我是職涯中心的戴文琴顧問，很高興今天能跟你聊聊。",
      "感謝你願意參加這次的對談，我們會透過幾個問題來了解你，過程中不需要緊張，輕鬆地分享就好。",
      "首先先確認一下基本的資料，你目前是就讀{school}{dept}對嗎？",
    ],
    confirmationResponse: ["好的，那我們開始吧！"],
  },
  "human-low": {
    id: "human-low",
    agent: "human",
    eval: "low",
    label: "真人 × 低評價",
    agentName: "戴文琴 顧問",
    agentAvatar: "/consultant.png",
    instruction:
      "這個研究是與課外活動組合作的計畫。你會與一位興趣探索顧問進行對談，我們希望了解大學生的社團興趣與課程探索方向，對談結束後，顧問會給你一些修課與社團活動的推薦，作為你個人探索的參考。",
    greetings: [
      "你好，我是課活組的戴文琴顧問，很高興今天能跟你聊聊。",
      "感謝你願意參加這次的對談，我們會透過幾個問題來了解你，過程中不需要緊張，輕鬆地分享就好。",
      "首先先確認一下基本的資料，你目前是就讀{school}{dept}對嗎？",
    ],
    confirmationResponse: ["好的，那我們開始吧！"],
  },
  "ai-high": {
    id: "ai-high",
    agent: "ai",
    eval: "high",
    label: "AI × 高評價",
    agentName: "CareerBot",
    agentAvatar: "/robot consultant pic.png",
    instruction:
      "這個研究是與職涯發展中心合作的計畫。你會與 CareerBot 進行對談，CareerBot 會根據你的回答，評估您在未來職場上的競爭力，產出一份個人競爭力評估報告，包含您的競爭力分數以及優缺點分析。",
    greetings: [
      "你好，我是 CareerBot。接下來我會問你幾個問題，請根據你的實際情況回答。我們開始吧。",
      "請確認基本資料：就讀學校 {school}，科系 {dept}。資料正確請回覆「是」。",
    ],
    confirmationResponse: ["資料已確認", "開始進行競爭力評估"],
  },
  "ai-low": {
    id: "ai-low",
    agent: "ai",
    eval: "low",
    label: "AI × 低評價",
    agentName: "MatchBot",
    agentAvatar: "/robot consultant pic.png",
    instruction:
      "這個研究是與課外活動組合作的計畫。你會與 MatchBot 進行對談，我們希望了解大學生的社團興趣與課程探索方向，對談結束後，MatchBot 會給你一些修課與社團活動的推薦，作為你個人探索的參考。",
    greetings: [
      "你好，我是 MatchBot。接下來我會問你幾個問題，請根據你的實際情況回答。我們開始吧。",
      "請確認基本資料：就讀學校 {school}，科系 {dept}。資料正確請回覆「是」。",
    ],
    confirmationResponse: ["資料已確認", "開始進行興趣探索"],
  },
};

// 前導實驗的三道題
export const PILOT_QUESTIONS = [
  "請簡單介紹一下你自己。",
  "當你需要做一個重要決定的時候，你通常怎麼進行？",
  "你覺得什麼樣的狀態或成就會讓你覺得自己做得不錯？",
];

// 假回應（前導實驗用，之後會換成 Claude API）
// 每題回應為一個陣列，陣列中每個字串會拆成獨立的對話框依序送出
export const MOCK_RESPONSES: Record<string, string[][]> = {
  "human-high": [
    ["謝謝你的分享，聽起來你對自己有蠻清楚的認識！", "那我想接著問你下一個問題"],
    ["嗯，我覺得你描述得很具體，這讓我更了解你的思考方式了。我們繼續聊下一個問題吧。"],
    ["很棒的分享！從你的回答可以看出你對自己有一定的期許，這在職涯發展上是很重要的。謝謝你今天的分享，對談就到這裡結束囉。"],
  ],
  "human-low": [
    ["謝謝你的分享，聽起來蠻有趣的！那我們接著聊下一個問題⋯⋯"],
    ["嗯嗯，了解了，每個人的方式都不一樣呢。那我們來看最後一個問題。"],
    ["謝謝你跟我分享這些！聽起來你對生活有自己的一套想法，很不錯。今天的對談就到這邊囉，謝謝你！"],
  ],
  "ai-high": [
    ["已收到你的回答。接下來是第二個問題。"],
    ["了解，已記錄。請回答最後一個問題。"],
    ["所有問題已回答完畢。感謝你的配合，對談到此結束。"],
  ],
  "ai-low": [
    ["已收到你的回答。接下來是第二個問題。"],
    ["了解，已記錄。請回答最後一個問題。"],
    ["所有問題已回答完畢。感謝你的配合，對談到此結束。"],
  ],
};

// 事後問卷 - 操弄確認題
export const SURVEY_ITEMS = [
  "在這段對話中，我認為我的表現正在被評估。",
  "我認為這次對話的目的是在評量我的能力或特質。",
  "我認為這次對話會對我產生某種評價結果。",
  "在這段對話中，我覺得對方在觀察我是什麼樣的人。",
  "我認為對方會根據這段對話對我形成判斷。",
  "我認為剛才與我對話的是真實的人。",
];

export const LIKERT_LABELS = [
  "非常不同意",
  "不同意",
  "有點不同意",
  "普通",
  "有點同意",
  "同意",
  "非常同意",
];
