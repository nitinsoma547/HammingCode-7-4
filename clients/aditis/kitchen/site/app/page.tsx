import Link from "next/link";
import { brand } from "@/content/brand";
import { Hero } from "@/components/Hero";
import { SignatureItems } from "@/components/SignatureItems";
import { LocationCard } from "@/components/LocationCard";
import { Footer } from "@/components/Footer";
import { CulturalAccent } from "@/components/CulturalAccent";

export default function Home() {
  const primary = brand.locations[0];
  const dialHref = `tel:${primary.phone.replace(/\D/g, "")}`;

  return (
    <main>
      <Hero
        parallelLabel={brand.parallelLabel}
        headline={brand.name}
        subhead={brand.tagline}
        intro={brand.shortIntro}
        ctaLabel={`Call ${primary.phone}`}
        ctaHref={dialHref}
        accent={brand.culturalAccent}
      />

      <SignatureItems title="On the menu today" items={brand.signatureItems} />

      <section className="relative px-6 md:px-12 lg:px-20 py-16 md:py-20 border-t border-[var(--color-line)] overflow-hidden">
        <CulturalAccent
          kind={brand.culturalAccent}
          className="absolute -left-8 -bottom-8 w-48 md:w-72 text-[var(--color-primary)]"
          opacity={0.1}
        />
        <div className="relative grid gap-10 md:gap-14 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-ink)] mb-4">
              Find us
            </h2>
            <p className="text-base md:text-lg text-[var(--color-ink)] opacity-80 max-w-md leading-relaxed">
              One kitchen in Ashburn. Tuesday through Sunday. The kitchen
              closes at 9pm sharp — the parippuvada usually runs out before.
            </p>
            <Link
              href="/menu"
              className="inline-block mt-6 text-base font-medium text-[var(--color-primary)] underline decoration-2 underline-offset-4"
            >
              See the full menu →
            </Link>
          </div>
          <div className="grid gap-6">
            {brand.locations.map((loc) => (
              <LocationCard key={loc.label} location={loc} />
            ))}
          </div>
        </div>
      </section>

      <Footer brand={brand} />
    </main>
  );
}
