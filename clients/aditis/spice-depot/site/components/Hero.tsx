import { CulturalAccent } from "./CulturalAccent";
import type { AccentKind } from "@/lib/cultural-accents";

type Props = {
  parallelLabel: string;
  headline: string;
  subhead: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  accent: AccentKind;
};

export function Hero({ parallelLabel, headline, subhead, intro, ctaLabel, ctaHref, accent }: Props) {
  return (
    <header className="relative px-6 md:px-12 lg:px-20 pt-16 pb-12 md:pt-24 md:pb-20 overflow-hidden">
      <CulturalAccent
        kind={accent}
        className="absolute -right-12 -top-12 w-64 md:w-96 text-[var(--color-primary)]"
        opacity={0.12}
      />
      <div className="relative max-w-3xl">
        <div className="text-sm md:text-base tracking-[0.18em] uppercase mb-6 opacity-60">
          {parallelLabel}
        </div>
        <h1 className="font-serif font-bold leading-[1.02] text-5xl md:text-7xl lg:text-8xl text-[var(--color-primary)] mb-6">
          {headline}
        </h1>
        <p className="font-serif text-xl md:text-2xl text-[var(--color-ink)] mb-6 leading-snug">
          {subhead}
        </p>
        <p className="text-base md:text-lg max-w-2xl text-[var(--color-ink)] opacity-80 mb-10 leading-relaxed">
          {intro}
        </p>
        <a
          href={ctaHref}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 bg-[var(--color-primary)] text-[var(--color-neutral)] font-medium text-base md:text-lg hover:opacity-90 transition-opacity"
        >
          {ctaLabel}
        </a>
      </div>
    </header>
  );
}
