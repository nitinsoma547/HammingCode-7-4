type Product = {
  name: string;
  price: string;
  note?: string;
};

type Props = {
  title: string;
  items: readonly Product[];
};

export function FeaturedProducts({ title, items }: Props) {
  return (
    <section className="px-6 md:px-12 lg:px-20 py-16 md:py-20 border-t border-[var(--color-line)]">
      <h2 className="font-serif text-3xl md:text-4xl mb-10 text-[var(--color-ink)]">
        {title}
      </h2>
      <div className="grid gap-8 md:gap-10 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.name} className="border-l-2 border-[var(--color-primary)] pl-5">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h3 className="font-serif text-xl md:text-2xl text-[var(--color-ink)]">
                {item.name}
              </h3>
              <span className="font-medium text-base text-[var(--color-primary)] tabular-nums whitespace-nowrap">
                {item.price}
              </span>
            </div>
            {item.note && (
              <p className="text-sm md:text-base text-[var(--color-ink)] opacity-70 leading-relaxed">
                {item.note}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
