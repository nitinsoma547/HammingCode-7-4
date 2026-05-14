import { accentPaths, type AccentKind } from "@/lib/cultural-accents";

type Props = {
  kind: AccentKind;
  className?: string;
  /** Opacity 0-1. Caller should keep ≤ 0.25 per design system rules. */
  opacity?: number;
};

export function CulturalAccent({ kind, className, opacity = 0.18 }: Props) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden="true"
      className={className}
      style={{ opacity }}
    >
      <path
        d={accentPaths[kind]}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
