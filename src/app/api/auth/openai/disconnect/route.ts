import { NextResponse } from "next/server";
import { readSession, writeSession } from "@/lib/session";

export async function POST() {
  const session = await readSession();
  delete session.openai;
  await writeSession(session);
  return NextResponse.json({ ok: true });
}

