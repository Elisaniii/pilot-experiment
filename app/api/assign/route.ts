import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

// 前導一只有兩個情境條件，互動對象皆為 AI
const CONDITION_IDS = ["ai-high", "ai-low"];

export async function POST() {
  const db = getDb();

  // allocation/counts 由 survey 完成時 +1，據此把新受試者分到「已完成人數較少」的那組
  const countsDoc = await db.collection("allocation").doc("counts").get();
  const counts = (countsDoc.exists ? countsDoc.data() : {}) as Record<string, number>;

  const conditionCounts = CONDITION_IDS.map((id) => ({ id, count: counts[id] ?? 0 }));
  const minCount = Math.min(...conditionCounts.map((c) => c.count));
  const candidates = conditionCounts.filter((c) => c.count === minCount);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  return NextResponse.json({ ok: true, conditionId: chosen.id });
}
