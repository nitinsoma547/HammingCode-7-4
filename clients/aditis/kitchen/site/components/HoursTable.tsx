import type { Hours } from "@/content/brand";

const DAYS: { key: keyof Hours; label: string }[] = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
  { key: "sun", label: "Sunday" },
];

export function HoursTable({ hours }: { hours: Hours }) {
  return (
    <dl className="grid grid-cols-[max-content_1fr] gap-x-6 gap-y-2 text-sm md:text-base">
      {DAYS.map(({ key, label }) => {
        const value = hours[key];
        return (
          <div key={key} className="contents">
            <dt className="text-[var(--color-ink)] opacity-70">{label}</dt>
            <dd className="text-[var(--color-ink)] tabular-nums">
              {value ?? <span className="opacity-50">Closed</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
