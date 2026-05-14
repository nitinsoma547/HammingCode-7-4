/**
 * Env-var loader for the backend. Every secret reads through here.
 * Never call process.env from anywhere else — that's a CLAUDE.md §9 rule.
 */

import "dotenv/config";

class MissingEnvError extends Error {
  constructor(name: string) {
    super(`Missing required env var: ${name}. See .env.example.`);
    this.name = "MissingEnvError";
  }
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.length === 0) {
    throw new MissingEnvError(name);
  }
  return value;
}

function optional(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const config = {
  env: (process.env.NODE_ENV ?? "development") as "development" | "production" | "test",
  port: Number(process.env.PORT ?? 4000),

  anthropic: {
    apiKey: optional("ANTHROPIC_API_KEY"),
    model: process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001",
  },

  meta: {
    /** Long-lived Page Access Token. Refresh ~60 days. */
    pageAccessToken: optional("META_PAGE_ACCESS_TOKEN"),
    /** Numeric Facebook Page ID. */
    fbPageId: optional("META_FB_PAGE_ID"),
    /** Numeric Instagram Business Account ID (linked to the FB Page). */
    igUserId: optional("META_IG_USER_ID"),
    /** Graph API version pinned per integration. v21.0 default — bump deliberately. */
    apiVersion: process.env.META_GRAPH_API_VERSION ?? "v21.0",
    /** App ID / Secret only used by the OAuth refresh flow. Not needed for simple posting. */
    appId: optional("META_APP_ID"),
    appSecret: optional("META_APP_SECRET"),
  },

  resend: {
    apiKey: optional("RESEND_API_KEY"),
  },

  fal: {
    apiKey: optional("FAL_KEY"),
  },

  stripe: {
    secretKey: optional("STRIPE_SECRET_KEY"),
    webhookSecret: optional("STRIPE_WEBHOOK_SECRET"),
  },

  supabase: {
    url: optional("SUPABASE_URL"),
    serviceRoleKey: optional("SUPABASE_SERVICE_ROLE_KEY"),
  },

  googlePlaces: {
    apiKey: optional("GOOGLE_PLACES_API_KEY"),
  },
};

/** Throw at startup if a service is referenced without its required env. */
export function requireMetaEnv(): {
  token: string;
  fbPageId: string;
  igUserId: string;
  apiVersion: string;
} {
  if (!config.meta.pageAccessToken) throw new MissingEnvError("META_PAGE_ACCESS_TOKEN");
  if (!config.meta.fbPageId) throw new MissingEnvError("META_FB_PAGE_ID");
  if (!config.meta.igUserId) throw new MissingEnvError("META_IG_USER_ID");
  return {
    token: config.meta.pageAccessToken,
    fbPageId: config.meta.fbPageId,
    igUserId: config.meta.igUserId,
    apiVersion: config.meta.apiVersion,
  };
}
