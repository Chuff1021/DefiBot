"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppTopbar, BottomActionBar, StatusChip } from "@/components/trade/TradeUI";

type ProviderStatus = {
  openai: {
    connected: boolean;
    email?: string;
    accountId?: string;
    expiresAt?: string;
    source?: string;
  };
  kalshi: {
    connected: boolean;
    baseUrl: string;
    accessKeyIdPreview?: string;
    balance?: string;
  };
  config: {
    openAiOAuthReady: boolean;
    allowLocalCodexImport: boolean;
  };
};

type ChipTone = "up" | "warning" | "neutral" | "danger";

export function ConnectConsole({ initialStatus }: { initialStatus: ProviderStatus }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState(initialStatus);
  const [accessKeyId, setAccessKeyId] = useState("");
  const [privateKeyPem, setPrivateKeyPem] = useState("");
  const [baseUrl, setBaseUrl] = useState(initialStatus.kalshi.baseUrl);
  const [tokenJson, setTokenJson] = useState("");
  const [manualAuthorizeUrl, setManualAuthorizeUrl] = useState("");
  const [manualCallbackUrl, setManualCallbackUrl] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const oauthStatus = useMemo(() => {
    if (status.openai.connected) {
      return { label: "connected", tone: "up" as ChipTone };
    }

    return {
      label: status.config.openAiOAuthReady ? "ready" : "env needed",
      tone: (status.config.openAiOAuthReady ? "warning" : "danger") as ChipTone,
    };
  }, [status]);

  async function reloadStatus() {
    const response = await fetch("/api/providers/status", { cache: "no-store" });
    const payload = (await response.json()) as ProviderStatus | { error: string };

    if (!response.ok || "error" in payload) {
      throw new Error("error" in payload ? payload.error : "Failed to refresh status.");
    }

    setStatus(payload);
  }

  function runAction(action: () => Promise<void>) {
    setFeedback(null);
    startTransition(() => {
      action().catch((cause) => {
        setFeedback(cause instanceof Error ? cause.message : "Request failed.");
      });
    });
  }

  const connectError = searchParams.get("error");
  const openAiNotice = searchParams.get("openai");

  return (
    <>
      <AppTopbar
        title="Connect ChatGPT OAuth and Kalshi sandbox"
        subtitle="Provider credentials are stored in an encrypted server-side session cookie so you can test real flows without shipping secrets into the client."
        rightLabel="session-backed"
      />

      <section className="connect-layout">
        <div className="connect-card">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[var(--text)]">OpenAI / ChatGPT</h2>
            <StatusChip label={oauthStatus.label} tone={oauthStatus.tone} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Use ChatGPT OAuth to power strategy analysis and research calls through your own account.</p>

          {status.openai.connected ? (
            <div className="connect-form-block">
              <div className="connect-detail-grid">
                <div className="connect-detail-cell">
                  <span>Account</span>
                  <strong>{status.openai.email ?? status.openai.accountId ?? "Connected"}</strong>
                </div>
                <div className="connect-detail-cell">
                  <span>Source</span>
                  <strong>{status.openai.source ?? "oauth"}</strong>
                </div>
              </div>
              <button
                type="button"
                className="connect-button-secondary"
                disabled={isPending}
                onClick={() =>
                  runAction(async () => {
                    const response = await fetch("/api/auth/openai/disconnect", { method: "POST" });
                    if (!response.ok) {
                      throw new Error("Failed to disconnect OpenAI.");
                    }
                    await reloadStatus();
                    router.refresh();
                  })
                }
              >
                Disconnect OpenAI
              </button>
            </div>
          ) : (
            <div className="connect-form-block">
              <div className="connect-detail-grid">
                <div className="connect-detail-cell">
                  <span>OAuth flow</span>
                  <strong>{status.config.openAiOAuthReady ? "Configured" : "Needs env"}</strong>
                </div>
                <div className="connect-detail-cell">
                  <span>Local import</span>
                  <strong>{status.config.allowLocalCodexImport ? "Available" : "Disabled"}</strong>
                </div>
              </div>
              <a href="/api/auth/openai/start" className={`connect-button-primary ${!status.config.openAiOAuthReady ? "button-disabled" : ""}`}>
                Start ChatGPT OAuth
              </a>
              <button
                type="button"
                className="connect-button-secondary"
                disabled={isPending}
                onClick={() =>
                  runAction(async () => {
                    const response = await fetch("/api/auth/openai/manual/start", { method: "POST" });
                    const payload = (await response.json()) as { error?: string; authorizeUrl?: string };
                    if (!response.ok) {
                      throw new Error(payload.error ?? "Failed to create manual OAuth URL.");
                    }
                    setManualAuthorizeUrl(payload.authorizeUrl ?? "");
                    setFeedback("Manual OAuth URL generated. Open it in a browser, finish login, then paste the callback URL below.");
                  })
                }
              >
                Generate manual OAuth URL
              </button>
              {manualAuthorizeUrl && (
                <>
                  <label className="connect-field">
                    <span>Manual OAuth URL</span>
                    <textarea readOnly value={manualAuthorizeUrl} rows={6} />
                  </label>
                  <a href={manualAuthorizeUrl} target="_blank" rel="noreferrer" className="connect-button-primary">
                    Open OAuth login
                  </a>
                  <label className="connect-field">
                    <span>Paste callback URL</span>
                    <textarea
                      value={manualCallbackUrl}
                      onChange={(event) => setManualCallbackUrl(event.target.value)}
                      placeholder="Paste the full callback URL after OpenAI redirects back"
                      rows={6}
                    />
                  </label>
                  <button
                    type="button"
                    className="connect-button-secondary"
                    disabled={isPending || !manualCallbackUrl.trim()}
                    onClick={() =>
                      runAction(async () => {
                        const response = await fetch("/api/auth/openai/manual/complete", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ callbackUrl: manualCallbackUrl }),
                        });
                        const payload = (await response.json()) as { error?: string };
                        if (!response.ok) {
                          throw new Error(payload.error ?? "Failed to complete manual OAuth.");
                        }
                        setManualCallbackUrl("");
                        await reloadStatus();
                        router.refresh();
                      })
                    }
                  >
                    Complete manual OAuth
                  </button>
                </>
              )}
              {status.config.allowLocalCodexImport && (
                <button
                  type="button"
                  className="connect-button-secondary"
                  disabled={isPending}
                  onClick={() =>
                    runAction(async () => {
                      const response = await fetch("/api/auth/openai/import-local", { method: "POST" });
                      const payload = (await response.json()) as { error?: string };
                      if (!response.ok) {
                        throw new Error(payload.error ?? "Failed to import local Codex auth.");
                      }
                      await reloadStatus();
                      router.refresh();
                    })
                  }
                >
                  Import local Codex ChatGPT session
                </button>
              )}
              <label className="connect-field">
                <span>Paste token JSON</span>
                <textarea
                  value={tokenJson}
                  onChange={(event) => setTokenJson(event.target.value)}
                  placeholder='Paste the contents of ~/.codex/auth.json or a token payload here'
                  rows={7}
                />
              </label>
              <button
                type="button"
                className="connect-button-secondary"
                disabled={isPending || !tokenJson.trim()}
                onClick={() =>
                  runAction(async () => {
                    const response = await fetch("/api/auth/openai/paste-token", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ tokenJson }),
                    });
                    const payload = (await response.json()) as { error?: string };
                    if (!response.ok) {
                      throw new Error(payload.error ?? "Failed to save pasted token.");
                    }
                    setTokenJson("");
                    await reloadStatus();
                    router.refresh();
                  })
                }
              >
                Save pasted token
              </button>
            </div>
          )}
        </div>

        <div className="connect-card">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold text-[var(--text)]">Kalshi Sandbox</h2>
            <StatusChip label={status.kalshi.connected ? "connected" : "disconnected"} tone={status.kalshi.connected ? "up" : "danger"} />
          </div>
          <p className="text-sm text-[var(--text-muted)]">Save your sandbox key ID and RSA private key to the encrypted session, then validate them against the sandbox balance endpoint.</p>

          <div className="connect-form-block">
            <div className="connect-field-grid">
              <label className="connect-field">
                <span>Sandbox base URL</span>
                <input value={baseUrl} onChange={(event) => setBaseUrl(event.target.value)} placeholder="https://demo-api.kalshi.co" />
              </label>
              <label className="connect-field">
                <span>Access key ID</span>
                <input value={accessKeyId} onChange={(event) => setAccessKeyId(event.target.value)} placeholder="Paste Kalshi access key ID" />
              </label>
            </div>
            <label className="connect-field">
              <span>RSA private key</span>
              <textarea value={privateKeyPem} onChange={(event) => setPrivateKeyPem(event.target.value)} placeholder="-----BEGIN PRIVATE KEY-----" rows={8} />
            </label>

            <div className="connect-action-row">
              <button
                type="button"
                className="connect-button-primary"
                disabled={isPending}
                onClick={() =>
                  runAction(async () => {
                    const response = await fetch("/api/kalshi/connect", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        accessKeyId,
                        privateKeyPem,
                        baseUrl,
                      }),
                    });
                    const payload = (await response.json()) as { error?: string; balance?: string };
                    if (!response.ok) {
                      throw new Error(payload.error ?? "Failed to connect Kalshi sandbox.");
                    }
                    setFeedback(`Kalshi sandbox connected. Balance: ${payload.balance ?? "Unavailable"}`);
                    setAccessKeyId("");
                    setPrivateKeyPem("");
                    await reloadStatus();
                    router.refresh();
                  })
                }
              >
                Validate and save
              </button>

              {status.kalshi.connected && (
                <button
                  type="button"
                  className="connect-button-secondary"
                  disabled={isPending}
                  onClick={() =>
                    runAction(async () => {
                      const response = await fetch("/api/kalshi/disconnect", { method: "POST" });
                      if (!response.ok) {
                        throw new Error("Failed to disconnect Kalshi sandbox.");
                      }
                      await reloadStatus();
                      router.refresh();
                    })
                  }
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="connect-card connect-card-side">
          <h2 className="text-base font-semibold text-[var(--text)]">Connection state</h2>
          <div className="connect-detail-grid mt-4">
            <div className="connect-detail-cell">
              <span>OpenAI</span>
              <strong>{status.openai.connected ? status.openai.email ?? "Connected" : "Not connected"}</strong>
            </div>
            <div className="connect-detail-cell">
              <span>Kalshi</span>
              <strong>{status.kalshi.connected ? status.kalshi.balance ?? "Connected" : "Not connected"}</strong>
            </div>
            <div className="connect-detail-cell">
              <span>Route</span>
              <strong>{status.kalshi.baseUrl}</strong>
            </div>
            <div className="connect-detail-cell">
              <span>Key preview</span>
              <strong>{status.kalshi.accessKeyIdPreview ?? "None"}</strong>
            </div>
          </div>

          {(feedback || connectError || openAiNotice) && (
            <div className="connect-feedback">
              {openAiNotice === "connected" && <p>OpenAI OAuth completed successfully.</p>}
              {connectError && <p>{connectError}</p>}
              {feedback && <p>{feedback}</p>}
            </div>
          )}

          <button
            type="button"
            className="connect-button-secondary mt-4"
            disabled={isPending}
            onClick={() =>
              runAction(async () => {
                await reloadStatus();
                router.refresh();
              })
            }
          >
            Refresh provider status
          </button>
        </div>
      </section>

      <BottomActionBar secondaryLabel="Back home" secondaryHref="/" primaryLabel="Open sandbox dashboard" primaryHref="/dashboard" />
    </>
  );
}
