import crypto from "crypto";
import { NextResponse } from "next/server";
import { kalshiAuthenticatedPost } from "@/lib/kalshi";
import { readSession } from "@/lib/session";

type CreateOrderBody = {
  ticker?: string;
  side?: "yes" | "no";
  count?: number;
  priceCents?: number;
  liveEnabled?: boolean;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateOrderBody;
    const session = await readSession();

    if (!session.kalshi?.connected) {
      return NextResponse.json({ error: "Connect Kalshi first." }, { status: 400 });
    }

    if (!body.liveEnabled) {
      return NextResponse.json({ error: "Live execution toggle is not enabled." }, { status: 400 });
    }

    if (!body.ticker || !body.side) {
      return NextResponse.json({ error: "Ticker and side are required." }, { status: 400 });
    }

    const count = Math.max(1, Math.min(1, Number(body.count ?? 1)));
    const priceCents = Number(body.priceCents ?? 0);
    if (!Number.isInteger(priceCents) || priceCents < 1 || priceCents > 99) {
      return NextResponse.json({ error: "Price must be an integer number of cents between 1 and 99." }, { status: 400 });
    }

    const payload = {
      ticker: body.ticker,
      side: body.side,
      action: "buy",
      type: "limit",
      count,
      client_order_id: crypto.randomUUID(),
      time_in_force: "fill_or_kill",
      ...(body.side === "yes" ? { yes_price: priceCents } : { no_price: priceCents }),
      buy_max_cost: priceCents * count,
      self_trade_prevention_type: "taker_at_cross",
    };

    const result = await kalshiAuthenticatedPost<{ order: Record<string, unknown> }>(
      {
        accessKeyId: session.kalshi.accessKeyId,
        privateKeyPem: session.kalshi.privateKeyPem,
        baseUrl: session.kalshi.baseUrl,
      },
      "/trade-api/v2/portfolio/orders",
      payload,
    );

    return NextResponse.json({ ok: true, order: result.order });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to create live order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
