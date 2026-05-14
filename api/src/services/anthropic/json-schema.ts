/**
 * Tiny local JSONSchema7 alias — saves us a dependency for a single type.
 * Tracks the JSON Schema Draft 7 shape Anthropic accepts in output_config.format.
 */
export type JSONSchema7 = {
  type?: string | string[];
  properties?: Record<string, JSONSchema7>;
  required?: string[];
  items?: JSONSchema7 | JSONSchema7[];
  enum?: unknown[];
  const?: unknown;
  additionalProperties?: boolean | JSONSchema7;
  description?: string;
  format?: string;
  anyOf?: JSONSchema7[];
  oneOf?: JSONSchema7[];
  allOf?: JSONSchema7[];
  $ref?: string;
  $defs?: Record<string, JSONSchema7>;
  [key: string]: unknown;
};
