/**
 * Anthropic SDK / agent-runner types.
 *
 * Pricing on claude-haiku-4-5-20251001 (per CLAUDE.md §3, May 2026):
 *   $1.00 / 1M input tokens
 *   $5.00 / 1M output tokens
 *   Cache write (5-min TTL): 1.25x input ($1.25 / 1M)
 *   Cache read:              0.1x input  ($0.10 / 1M)
 */

import type { JSONSchema7 } from "./json-schema";

export const HAIKU_INPUT_PER_MTOK_CENTS = 100; // $1.00
export const HAIKU_OUTPUT_PER_MTOK_CENTS = 500; // $5.00
export const HAIKU_CACHE_WRITE_PER_MTOK_CENTS = 125; // $1.25 (1.25x)
export const HAIKU_CACHE_READ_PER_MTOK_CENTS = 10;   // $0.10 (0.1x)

export interface AgentRunInput<TOutput> {
  /** Filename in .claude/agents/ without extension, e.g. "social-media-planner". */
  agentName: string;
  /** Parsed brand_profile.json — stable across a client's month (cached). */
  brandProfile: unknown;
  /** Optional monthly intake (this month's promotions / events / photo refs). */
  monthlyIntake?: unknown;
  /** YYYY-MM. */
  month: string;
  /** What you want this run to produce, as a sentence. e.g. "the 30-day FB+IG social calendar". */
  task: string;
  /** JSON Schema the output must satisfy. */
  outputSchema: JSONSchema7;
  /** Optional extra context (e.g. cultural-calendar output to feed into social-media-planner). */
  additionalContext?: Record<string, unknown>;
}

export interface AgentRunResult<TOutput> {
  agent: string;
  model: string;
  output: TOutput;
  usage: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
  /** Computed dollar cost in cents. */
  costCents: number;
  /** 0..1 — share of input tokens served from cache. */
  cacheHitRate: number;
  /** Anthropic request_id for support. */
  requestId?: string;
}
