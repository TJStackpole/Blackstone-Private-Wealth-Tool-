import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";

/** Neutral, two-sided: the situations each structure suits. */
export default function WhenEachFits() {
  const cols = [
    { title: "A drawdown fund can fit", items: COMPARE.fits.drawdown },
    { title: "An evergreen fund can fit", items: COMPARE.fits.evergreen },
  ];
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {cols.map((c) => (
        <section key={c.title} aria-label={c.title} className="rounded-card border border-line bg-bg-raised p-4 sm:p-5">
          <h3 className="mb-2 text-sm font-medium text-ink">{c.title}</h3>
          <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted-strong">
            {c.items.map((i) => (
              <li key={i.slice(0, 30)}>{i}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
