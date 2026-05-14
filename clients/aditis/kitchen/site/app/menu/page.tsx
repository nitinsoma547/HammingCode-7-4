import type { Metadata } from "next";
import Link from "next/link";
import { brand } from "@/content/brand";
import { MenuSection } from "@/components/MenuSection";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "Menu",
  description: `Full menu — ${brand.name}. Dosas, idli, vada, tiffin, rice plates, beverages.`,
};

export default function MenuPage() {
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
          Menu
        </h1>
        <p className="text-base md:text-lg opacity-75 max-w-2xl mt-4 leading-relaxed">
          Everything fresh-made to order. Dosas need eight to twelve
          minutes in the busy hour — worth the wait.
        </p>
      </header>

      <section className="px-6 md:px-12 lg:px-20 pb-20">
        <MenuSection categories={brand.menu} />
      </section>

      <Footer brand={brand} />
    </main>
  );
}
