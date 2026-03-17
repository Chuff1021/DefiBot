import crypto from "crypto";

export type KalshiCredentials = {
  accessKeyId: string;
  privateKeyPem: string;
  baseUrl: string;
};

type KalshiMarket = {
  ticker?: string;
  title?: string;
  subtitle?: string;
  yes_bid_dollars?: string;
  yes_ask_dollars?: string;
  volume?: number;
  status?: string;
};

function normalizeBaseUrl(baseUrl: string) {
  const value = baseUrl.trim().replace(/\/$/, "");
  return value || "https://demo-api.kalshi.co";
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
  const response = await fetch(`${normalizeBaseUrl(baseUrl)}/trade-api/v2/markets?status=open&limit=${limit}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Kalshi markets request failed (${response.status}): ${text.slice(0, 300)}`);
  }

  const payload = (await response.json()) as { markets?: KalshiMarket[] };
  return payload.markets ?? [];
}

export async function getKalshiBalance(credentials: KalshiCredentials) {
  return validateKalshiCredentials(credentials);
}

