/**
 * Typed service error envelope — every external integration throws this.
 * The api/ layer never silently swallows errors per CLAUDE.md §9 conventions.
 */

type ServiceName = "anthropic" | "meta" | "outstand" | "resend" | "fal" | "stripe" | "supabase" | "google-places";

export class ServiceError extends Error {
  readonly service: ServiceName;
  readonly code: string;
  override readonly cause?: unknown;

  constructor(service: ServiceName, code: string, message: string, cause?: unknown) {
    super(`[${service}:${code}] ${message}`);
    this.name = "ServiceError";
    this.service = service;
    this.code = code;
    this.cause = cause;
  }
}
