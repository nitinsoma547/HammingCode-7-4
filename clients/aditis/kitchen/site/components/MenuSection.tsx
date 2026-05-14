import type { MenuCategory } from "@/content/brand";

type Props = {
  categories: readonly MenuCategory[];
};

export function MenuSection({ categories }: Props) {
  return (
    <div className="grid gap-16 md:gap-20">
      {categories.map((cat) => (
        <section key={cat.title}>
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--color-primary)] mb-6 md:mb-8">
            {cat.title}
          </h2>
          <ul className="divide-y divide-[var(--color-line)]">
            {cat.items.map((item) => (
              <li key={item.name} className="py-4 md:py-5 flex items-baseline justify-between gap-6">
                <div className="flex-1">
                  <div className="font-serif text-lg md:text-xl text-[var(--color-ink)]">
                    {item.name}
                  </div>
                  {item.note && (
                    <div className="text-sm text-[var(--color-ink)] opacity-65 mt-1">
                      {item.note}
                    </div>
                  )}
                </div>
                <div className="font-medium text-base md:text-lg text-[var(--color-primary)] tabular-nums whitespace-nowrap">
                  {item.price}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
