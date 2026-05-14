import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/brand";
import { LocationCard } from "@/components/LocationCard";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Contact",
  description: `Find ${brand.name} — two locations in Loudoun County, hours, phone, and directions.`,
};

export default function ContactPage() {
  return (
    <main>
      <header className="px-6 md:px-12 lg:px-20 pt-16 pb-10 md:pt-20 md:pb-14">
        <Link
          href="/"
          className="text-sm text-[var(--color-ink)] opacity-60 hover:opacity-90 underline underline-offset-4"
        >
          ← {brand.name}
        </Link>
        <h1 className="font-serif font-bold text-5xl md:text-7xl text-[var(--color-primary)] mt-6 leading-[1.05]">
          Find us
        </h1>
        <p className="text-base md:text-lg opacity-75 max-w-2xl mt-4 leading-relaxed">
          Two stores in Loudoun County — Ashburn and Herndon. Both open
          ten to nine, seven days a week. Call ahead for bulk orders or
          to ask whether a specific spice is in stock.
        </p>
      </header>

      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
          {brand.locations.map((loc) => (
            <LocationCard key={loc.label} location={loc} />
          ))}
        </div>
      </section>

      <Footer brand={brand} />
    </main>
  );
}
