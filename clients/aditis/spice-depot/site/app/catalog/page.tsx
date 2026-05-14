import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/brand";
import { CatalogSection } from "@/components/CatalogSection";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Catalog",
  description: `Whole spices, ground masalas, rice, lentils, snacks, sweets — ${brand.name}, Ashburn and Herndon.`,
};

export default function CatalogPage() {
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
          Catalog
        </h1>
        <p className="text-base md:text-lg opacity-75 max-w-2xl mt-4 leading-relaxed">
          Whole and ground spices, rice, lentils, snacks, and festival
          sweets. Prices marked TODO are being verified — call the store
          for current pricing.
        </p>
      </header>

      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <CatalogSection categories={brand.catalog} />
      </section>

      <Footer brand={brand} />
    </main>
  );
}
