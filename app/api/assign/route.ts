import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

const CONDITION_IDS = ["human-high", "human-low", "ai-high", "ai-low"];

export async function POST(request: Request) {
  const body = await request.json();
  const participantId = body?.participantId;

  if (!participantId) {
    return NextResponse.json({ ok: false, error: "missing participantId" }, { status: 400 });
  }

  const db = getDb();

  const participantDoc = await db.collection("participants").doc(participantId).get();
  if (!participantDoc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }
  const school = participantDoc.data()?.school || "";

  const countsDoc = await db.collection("allocation").doc("counts").get();
  const counts = (countsDoc.exists ? countsDoc.data() : {}) as Record<string, number>;

  const conditionCounts = CONDITION_IDS.map((id) => ({ id, count: counts[id] ?? 0 }));
  const minCount = Math.min(...conditionCounts.map((c) => c.count));
  const candidates = conditionCounts.filter((c) => c.count === minCount);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  return NextResponse.json({ ok: true, school, conditionId: chosen.id });
}
