import type { Promo } from "@/content/brand";

type Props = {
  promo: Promo;
};

/**
 * Full-width promo band. Bold serif label + supporting message on the
 * accent color. Used on the homepage only — keep restraint.
 */
export function PromoStrip({ promo }: Props) {
  return (
    <aside className="bg-[var(--color-accent)] text-[var(--color-neutral)]">
      <div className="px-6 md:px-12 lg:px-20 py-5 md:py-6 flex flex-col md:flex-row md:items-baseline md:gap-6">
        <div className="font-serif font-bold uppercase tracking-[0.18em] text-sm md:text-base">
          {promo.label}
        </div>
        <p className="font-serif text-lg md:text-2xl leading-snug mt-1 md:mt-0">
          {promo.message}
        </p>
      </div>
    </aside>
  );
}
