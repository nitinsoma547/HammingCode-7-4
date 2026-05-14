import type { Location } from "@/content/brand";
import { HoursTable } from "./HoursTable";

export function LocationCard({ location }: { location: Location }) {
  const dialHref = `tel:${location.phone.replace(/\D/g, "")}`;
  return (
    <article className="border border-[var(--color-line)] rounded-lg p-6 md:p-8 bg-white/40">
      <h3 className="font-serif text-2xl md:text-3xl text-[var(--color-primary)] mb-4">
        {location.label}
      </h3>
      <address className="not-italic text-base md:text-lg text-[var(--color-ink)] leading-relaxed mb-4">
        {location.address}
      </address>
      <div className="mb-6">
        <a
          href={dialHref}
          className="inline-block text-base md:text-lg font-medium text-[var(--color-primary)] underline decoration-2 underline-offset-4 hover:opacity-80"
        >
          {location.phone}
        </a>
      </div>
      <h4 className="font-serif text-lg text-[var(--color-ink)] mb-3">Hours</h4>
      <HoursTable hours={location.hours} />
      {location.mapsUrl && (
        <a
          href={location.mapsUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-block mt-6 text-sm font-medium text-[var(--color-primary)] underline underline-offset-4"
        >
          Get directions →
        </a>
      )}
    </article>
  );
}
