import type { Brand } from "@/content/brand";

export function Footer({ brand }: { brand: Brand }) {
  const primary = brand.locations[0];
  return (
    <footer className="px-6 md:px-12 lg:px-20 py-10 md:py-12 border-t border-[var(--color-line)] text-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="font-serif text-lg text-[var(--color-primary)]">{brand.name}</div>
          <div className="opacity-70 mt-1">{primary.address}</div>
        </div>
        <div className="flex flex-wrap items-center gap-6 opacity-80">
          <a href={`tel:${primary.phone.replace(/\D/g, "")}`} className="underline underline-offset-4">
            {primary.phone}
          </a>
          {brand.links.instagram && (
            <a href={brand.links.instagram} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              Instagram
            </a>
          )}
          {brand.links.facebook && (
            <a href={brand.links.facebook} target="_blank" rel="noreferrer" className="underline underline-offset-4">
              Facebook
            </a>
          )}
        </div>
      </div>
      <div className="mt-6 text-xs opacity-50">
        © {new Date().getFullYear()} {brand.name}.
      </div>
    </footer>
  );
}
