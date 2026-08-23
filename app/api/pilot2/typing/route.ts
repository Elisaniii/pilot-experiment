import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";

// 研究者是否正在打字，供受試者端顯示「打字中⋯」動畫
export async function POST(request: Request) {
  const { code, typing } = await request.json();

  if (typeof code !== "string" || typeof typing !== "boolean") {
    return NextResponse.json({ ok: false, error: "invalid payload" }, { status: 400 });
  }

  const ref = getDb().collection("pilot2-sessions").doc(code);
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  await ref.update({ operatorTyping: typing });
  return NextResponse.json({ ok: true });
}
