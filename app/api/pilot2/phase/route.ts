import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

const ALLOWED = ["waiting", "conv1", "transition", "conv2", "postchat", "done"];

// 研究者推進流程階段
export async function POST(request: Request) {
  const { code, phase } = await request.json();

  if (typeof code !== "string" || !ALLOWED.includes(phase)) {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const ref = getDb().collection("pilot2-sessions").doc(code);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  await ref.update({ phase });
  return NextResponse.json({ ok: true });
}
