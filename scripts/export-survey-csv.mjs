import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = process.cwd();
const outputFile = path.join(root, "data", "survey-responses.csv");

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "缺少 Firebase 服務帳號環境變數，請確認 .env.local 內有 FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY"
  );
  process.exit(1);
}

initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore();

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

const snapshot = await db.collection("survey-responses").orderBy("timestamp", "asc").get();
const records = snapshot.docs.map((doc) => {
  const data = doc.data();
  return {
    ...data,
    timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toISOString() : "",
  };
});

if (records.length === 0) {
  console.log("Firestore 中尚無資料。");
  process.exit(0);
}

const maxQuestions = Math.max(...records.map((r) => r.ratings.length));
const header = [
  "condition",
  "timestamp",
  ...Array.from({ length: maxQuestions }, (_, i) => `Q${i + 1}_score`),
  "openAnswer",
];

const rows = records.map((r) => {
  const scores = r.ratings.map((item) => item.score);
  while (scores.length < maxQuestions) scores.push("");
  return [r.condition, r.timestamp, ...scores, r.openAnswer].map(csvEscape).join(",");
});

const csv = [header.join(","), ...rows].join("\n") + "\n";
await mkdir(path.join(root, "data"), { recursive: true });
await writeFile(outputFile, csv, "utf-8");

console.log(`已匯出 ${records.length} 筆資料至 ${outputFile}`);
console.log("\n題目對照（Q1~Q6 對應的問卷題目）：");
records[0]?.ratings.forEach((item, i) => {
  console.log(`Q${i + 1}: ${item.item}`);
});
