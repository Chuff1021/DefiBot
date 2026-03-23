import crypto from "crypto";

export type KalshiCredentials = {
  accessKeyId: string;
  privateKeyPem: string;
  baseUrl: string;
};

export type KalshiMarket = {
  ticker?: string;
  event_ticker?: string;
  title?: string;
  subtitle?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  volume?: number;
  volume_fp?: string;
  status?: string;
};

export type KalshiOrderbook = {
  orderbook_fp?: {
    yes_dollars?: Array<[string, string]>;
    no_dollars?: Array<[string, string]>;
  };
};

function normalizeBaseUrl(baseUrl: string) {
  const value = baseUrl.trim().replace(/\/$/, "");
  return value || "https://api.elections.kalshi.com";
}

function getSignature(privateKeyPem: string, message: string) {
  return crypto
    .sign("sha256", Buffer.from(message, "utf8"), {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    })
    .toString("base64");
}

async function kalshiFetch<T>(credentials: KalshiCredentials, input: { method?: "GET" | "POST"; path: string; body?: unknown }) {
  const method = input.method ?? "GET";
  const pathWithoutQuery = input.path.split("?")[0] ?? input.path;
  const timestamp = Date.now().toString();
  const signature = getSignature(credentials.privateKeyPem, `${timestamp}${method}${pathWithoutQuery}`);

  const response = await fetch(`${normalizeBaseUrl(credentials.baseUrl)}${input.path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "KALSHI-ACCESS-KEY": credentials.accessKeyId,
      "KALSHI-ACCESS-SIGNATURE": signature,
      "KALSHI-ACCESS-TIMESTAMP": timestamp,
    },
    body: input.body ? JSON.stringify(input.body) : undefined,
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Kalshi request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return (await response.json()) as T;
}

export async function kalshiAuthenticatedGet<T>(credentials: KalshiCredentials, path: string) {
  return kalshiFetch<T>(credentials, { path });
}

export async function kalshiAuthenticatedPost<T>(credentials: KalshiCredentials, path: string, body: unknown) {
  return kalshiFetch<T>(credentials, { method: "POST", path, body });
}

export async function validateKalshiCredentials(credentials: KalshiCredentials) {
  const balance = await kalshiFetch<{ balance?: number; balance_dollars?: string }>(credentials, {
    path: "/trade-api/v2/portfolio/balance",
  });

  return {
    balance:
      balance.balance_dollars ??
      (typeof balance.balance === "number" ? `$${(balance.balance / 100).toFixed(2)}` : "Unavailable"),
  };
}

export async function getKalshiMarkets(baseUrl: string, limit = 6) {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);
  const pageSize = Math.min(Math.max(limit, 1), 1000);
  const results: KalshiMarket[] = [];
  let cursor = "";

  while (results.length < limit) {
    const params = new URLSearchParams({
      status: "open",
      limit: String(Math.min(pageSize, 1000)),
    });

    if (cursor) {
      params.set("cursor", cursor);
    }

    const response = await fetch(`${normalizedBaseUrl}/trade-api/v2/markets?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Kalshi markets request failed (${response.status}): ${text.slice(0, 300)}`);
    }

    const payload = (await response.json()) as { markets?: KalshiMarket[]; cursor?: string };
    const markets = (payload.markets ?? []).map((market) => ({
      ...market,
      volume:
        typeof market.volume === "number"
          ? market.volume
          : typeof market.volume_fp === "string"
            ? Number.parseFloat(market.volume_fp)
            : undefined,
    }));

    results.push(...markets);

    if (!payload.cursor || markets.length === 0) {
      break;
    }

    cursor = payload.cursor;
  }

  return results.slice(0, limit);
}

export async function getKalshiBalance(credentials: KalshiCredentials) {
  return validateKalshiCredentials(credentials);
}

export async function getKalshiOrderbook(baseUrl: string, ticker: string) {
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/trade-api/v2/markets/${encodeURIComponent(ticker)}/orderbook`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Kalshi orderbook request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  return (await response.json()) as KalshiOrderbook;
}

export function findBestBtc15mMarket(markets: KalshiMarket[]) {
  return [...markets]
    .filter((market) => {
      const text = `${market.title ?? ""} ${market.subtitle ?? ""} ${market.ticker ?? ""} ${market.event_ticker ?? ""}`.toLowerCase();
      return (
        (text.includes("btc") || text.includes("bitcoin")) &&
        (text.includes("15 minute") || text.includes("15m") || text.includes("15 min"))
      );
    })
    .sort((a, b) => (b.volume ?? 0) - (a.volume ?? 0))[0];
}

export function rankCryptoMarkets(markets: KalshiMarket[]) {
  return [...markets]
    .map((market) => {
      const text = `${market.title ?? ""} ${market.subtitle ?? ""} ${market.ticker ?? ""} ${market.event_ticker ?? ""}`.toLowerCase();
      let score = 0;

      if (text.includes("btc") || text.includes("bitcoin")) score += 6;
      if (text.includes("crypto")) score += 3;
      if (text.includes("15 minute") || text.includes("15m") || text.includes("15 min")) score += 5;
      if (text.includes("hour") || text.includes("daily")) score += 2;
      if (text.includes("up or down") || text.includes("up/down")) score += 3;
      if (text.includes("above") || text.includes("below") || text.includes("between")) score += 2;
      if (text.includes("nba") || text.includes("ncaa") || text.includes("duke") || text.includes("uconn")) score -= 10;
      if ((market.volume ?? 0) > 0) score += Math.min((market.volume ?? 0) / 50000, 4);

      return { market, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.market.volume ?? 0) - (a.market.volume ?? 0));
}
