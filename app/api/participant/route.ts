import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const participantId = searchParams.get("id");

  if (!participantId) {
    return NextResponse.json({ ok: false, error: "missing id" }, { status: 400 });
  }

  const snapshot = await getDb().collection("participants").doc(participantId).get();

  if (!snapshot.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const data = snapshot.data();
  return NextResponse.json({ ok: true, school: data?.school || "" });
}
