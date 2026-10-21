/** "How to say it to a client": plain talking points in neutral language (Rule 8: no "you should"). */
export default function ClientScriptCard({ points, title = "How to say it to a client" }: { points: string[]; title?: string }) {
  return (
    <section aria-label={title} className="rounded-card border border-line bg-bg-raised p-4">
      <h3 className="mb-2 font-serif text-base font-medium text-ink">{title}</h3>
      <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted-strong">
        {points.map((p) => (
          <li key={p.slice(0, 40)}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
