import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { validateKalshiCredentials } from "@/lib/kalshi";
import { readSession, writeSession } from "@/lib/session";

type KalshiConnectBody = {
  accessKeyId?: string;
  privateKeyPem?: string;
  baseUrl?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as KalshiConnectBody;
    const accessKeyId = body.accessKeyId?.trim();
    const privateKeyPem = body.privateKeyPem?.trim();
    const baseUrl = body.baseUrl?.trim() || env.kalshiBaseUrl;

    if (!accessKeyId || !privateKeyPem) {
      return NextResponse.json({ error: "Kalshi access key ID and private key are required." }, { status: 400 });
    }

    const validation = await validateKalshiCredentials({
      accessKeyId,
      privateKeyPem,
      baseUrl,
    });

    const session = await readSession();
    await writeSession({
      ...session,
      kalshi: {
        connected: true,
        accessKeyId,
        privateKeyPem,
        baseUrl,
        lastBalance: validation.balance,
        lastValidatedAt: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true, balance: validation.balance });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to connect to Kalshi sandbox.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

