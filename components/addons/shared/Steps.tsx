/** A short sequence shown as numbered cards with an arrow between them, instead of a paragraph. Use only for real sequences. */
export default function Steps({ steps }: { steps: { title: string; text: string }[] }) {
  return (
    <ol className="grid gap-3 sm:grid-flow-col sm:auto-cols-fr">
      {steps.map((s, i) => (
        <li key={s.title} className="relative rounded-card border border-line bg-bg-raised p-4 sm:p-5">
          <span aria-hidden className="tnum mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-contrast">
            {i + 1}
          </span>
          <p className="font-medium leading-snug text-ink">{s.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-strong">{s.text}</p>
          {i < steps.length - 1 && (
            <span aria-hidden className="absolute -right-2.5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-bg text-[11px] text-muted sm:inline-flex">
              →
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
