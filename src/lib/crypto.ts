import crypto from "crypto";
import zlib from "zlib";

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function toBase64Url(input: Buffer) {
  return input
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64");
}

function getKey(secret: string) {
  return crypto.createHash("sha256").update(secret).digest();
}

export function createRandomToken(bytes = 32) {
  return toBase64Url(crypto.randomBytes(bytes));
}

export async function createPkceChallenge(verifier: string) {
  const digest = crypto.createHash("sha256").update(verifier).digest();
  return toBase64Url(digest);
}

export function encryptJson(secret: string, payload: JsonValue) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(secret), iv);
  const compressed = zlib.brotliCompressSync(Buffer.from(JSON.stringify(payload), "utf8"));
  const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [toBase64Url(iv), toBase64Url(tag), toBase64Url(encrypted)].join(".");
}

export function decryptJson<T>(secret: string, payload: string): T {
  const [ivEncoded, tagEncoded, dataEncoded] = payload.split(".");

  if (!ivEncoded || !tagEncoded || !dataEncoded) {
    throw new Error("Invalid encrypted payload");
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", getKey(secret), fromBase64Url(ivEncoded));
  decipher.setAuthTag(fromBase64Url(tagEncoded));
  const compressed = Buffer.concat([decipher.update(fromBase64Url(dataEncoded)), decipher.final()]);
  const plaintext = zlib.brotliDecompressSync(compressed).toString("utf8");
  return JSON.parse(plaintext) as T;
}
