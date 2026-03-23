import { NextResponse } from "next/server";
import { runFixtureBackedResearchSlice } from "@/lib/defi";

export async function GET() {
  try {
    const result = await runFixtureBackedResearchSlice();

    return NextResponse.json({
      mode: "fixture-paper",
      generatedAt: new Date().toISOString(),
      result,
    });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to evaluate the DeFi research slice.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
