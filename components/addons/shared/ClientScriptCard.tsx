"use client";

import { useAudience } from "./Audience";

interface Props {
  points: string[];
  title?: string;
  /** Investment-committee wording shown in Family Office mode. */
  icPoints?: string[];
  /** Always print the investment-committee wording (for memo-style printouts). */
  icInPrint?: boolean;
}

/** "How to say it to a client" (or, in Family Office mode, what an investment committee may ask). Neutral language (Rule 8). */
export default function ClientScriptCard({ points, title = "How to say it to a client", icPoints, icInPrint = false }: Props) {
  const ic = useAudience() === "family-office" && !!icPoints;
  const heading = ic ? "What your investment committee may ask" : title;
  const list = ic ? icPoints! : points;
  const printSwap = icInPrint && !!icPoints && !ic;
  return (
    <>
      {printSwap && <Card heading="What your investment committee may ask" list={icPoints!} className="hidden print:block" />}
      <Card heading={heading} list={list} className={printSwap ? "print:hidden" : ""} audience={ic ? "family-office" : "advisor"} />
    </>
  );
}

function Card({ heading, list, className = "", audience }: { heading: string; list: string[]; className?: string; audience?: string }) {
  return (
    <section aria-label={heading} className={`rounded-card border border-line bg-bg-raised p-4 print:p-2 ${className}`} data-audience={audience}>
      <h3 className="mb-2 font-serif text-base font-medium text-ink print:mb-1 print:text-sm">{heading}</h3>
      <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted-strong print:space-y-0.5 print:text-xs">
        {list.map((p) => (
          <li key={p.slice(0, 40)}>{p}</li>
        ))}
      </ul>
    </section>
  );
}
