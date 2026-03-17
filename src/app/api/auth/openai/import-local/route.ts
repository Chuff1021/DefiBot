import fs from "fs/promises";
import os from "os";
import path from "path";
import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { createOpenAiSession, fetchOpenAiProfile } from "@/lib/openai";
import { readSession, writeSession } from "@/lib/session";

type LocalCodexAuth = {
  tokens?: {
    access_token?: string;
    refresh_token?: string;
    account_id?: string;
  };
};

export async function POST() {
  if (!env.allowLocalCodexImport) {
    return NextResponse.json({ error: "Local Codex import is disabled." }, { status: 403 });
  }

  try {
    const authPath = path.join(os.homedir(), ".codex", "auth.json");
    const raw = await fs.readFile(authPath, "utf8");
    const parsed = JSON.parse(raw) as LocalCodexAuth;
    const accessToken = parsed.tokens?.access_token;

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found in local Codex auth." }, { status: 400 });
    }

    const profile = await fetchOpenAiProfile(accessToken);
    const session = await readSession();

    await writeSession({
      ...session,
      openai: createOpenAiSession(
        {
          access_token: accessToken,
          refresh_token: parsed.tokens?.refresh_token,
        },
        {
          id: parsed.tokens?.account_id ?? profile.id,
          email: profile.email,
          name: profile.name,
        },
        "local-codex",
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Failed to import local Codex auth.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

