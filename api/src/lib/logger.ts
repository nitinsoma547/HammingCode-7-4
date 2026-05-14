/**
 * Tiny logger. Adds redaction for fields we must never log:
 * access tokens, API keys, customer phone numbers, photo URLs in full.
 */

const REDACT_KEYS = new Set([
  "access_token",
  "page_access_token",
  "app_secret",
  "api_key",
  "apiKey",
  "secret",
  "authorization",
  "Authorization",
  "phone",
  "whatsapp",
  "photo_urls",
]);

function redact(value: unknown): unknown {
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redact);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value)) {
    if (REDACT_KEYS.has(k)) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = redact(v);
    }
  }
  return out;
}

type Level = "debug" | "info" | "warn" | "error";

function emit(level: Level, msg: string, meta?: Record<string, unknown>) {
  const line = {
    t: new Date().toISOString(),
    level,
    msg,
    ...(meta ? { meta: redact(meta) as Record<string, unknown> } : {}),
  };
  const stream = level === "error" ? process.stderr : process.stdout;
  stream.write(JSON.stringify(line) + "\n");
}

export const log = {
  debug: (msg: string, meta?: Record<string, unknown>) => emit("debug", msg, meta),
  info: (msg: string, meta?: Record<string, unknown>) => emit("info", msg, meta),
  warn: (msg: string, meta?: Record<string, unknown>) => emit("warn", msg, meta),
  error: (msg: string, meta?: Record<string, unknown>) => emit("error", msg, meta),
};
