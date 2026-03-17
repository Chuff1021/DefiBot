import { DashboardConsole } from "@/components/dashboard/DashboardConsole";
import { env } from "@/lib/env";
import { getKalshiMarkets } from "@/lib/kalshi";
import { readSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await readSession();
  const markets = await getKalshiMarkets(session.kalshi?.baseUrl ?? env.kalshiBaseUrl, 6).catch(() => []);

  return (
    <DashboardConsole
      initialStatus={{
        openai: {
          connected: Boolean(session.openai?.connected),
          email: session.openai?.email,
        },
        kalshi: {
          connected: Boolean(session.kalshi?.connected),
          baseUrl: session.kalshi?.baseUrl ?? env.kalshiBaseUrl,
          balance: session.kalshi?.lastBalance,
        },
        markets,
      }}
    />
  );
}
