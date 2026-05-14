import Link from "next/link";
import { brand } from "@/content/brand";
import { Hero } from "@/components/Hero";
import { PromoStrip } from "@/components/PromoStrip";
import { FeaturedProducts } from "@/components/FeaturedProducts";
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

      <PromoStrip promo={brand.promo} />

      <FeaturedProducts title="What we're known for" items={brand.featuredProducts} />

      <section className="relative px-6 md:px-12 lg:px-20 py-16 md:py-20 border-t border-[var(--color-line)] overflow-hidden">
        <CulturalAccent
          kind={brand.culturalAccent}
          className="absolute -left-8 -bottom-8 w-48 md:w-72 text-[var(--color-primary)]"
          opacity={0.1}
        />
        <div className="relative grid gap-10 md:gap-14 md:grid-cols-2 md:items-start">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-ink)] mb-4">
              Two stores, both open every day
            </h2>
            <p className="text-base md:text-lg text-[var(--color-ink)] opacity-80 max-w-md leading-relaxed">
              Ashburn on Russell Branch and Herndon on Centreville Road.
              Same shelves, same hand-ground masalas, ten to nine, seven
              days a week.
            </p>
            <Link
              href="/catalog"
              className="inline-block mt-6 text-base font-medium text-[var(--color-primary)] underline decoration-2 underline-offset-4"
            >
              Browse the full catalog →
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
