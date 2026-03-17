import { ConnectConsole } from "@/components/connect/ConnectConsole";
import { env } from "@/lib/env";
import { readSession } from "@/lib/session";

export default async function ConnectPage() {
  const session = await readSession();

  return (
    <ConnectConsole
      initialStatus={{
        openai: {
          connected: Boolean(session.openai?.connected),
          email: session.openai?.email,
          accountId: session.openai?.accountId,
          expiresAt: session.openai?.expiresAt,
          source: session.openai?.source,
        },
        kalshi: {
          connected: Boolean(session.kalshi?.connected),
          baseUrl: session.kalshi?.baseUrl ?? env.kalshiBaseUrl,
          accessKeyIdPreview: session.kalshi?.accessKeyId ? `${session.kalshi.accessKeyId.slice(0, 6)}...` : undefined,
          balance: session.kalshi?.lastBalance,
        },
        config: {
          openAiOAuthReady: Boolean(env.openAiClientId),
          allowLocalCodexImport: env.allowLocalCodexImport,
        },
      }}
    />
  );
}

