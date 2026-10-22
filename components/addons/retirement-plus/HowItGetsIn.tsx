import { Fragment, type ReactNode } from "react";
import { MODEL, ROOM, type AudienceId } from "@/lib/addons/retirement-plus/data";
import Cite from "./Cite";

const slice = MODEL.assumptions.privatePct.value;

const icon = (d: ReactNode) => (
  <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);

const STEPS = [
  {
    id: "worker",
    label: "Worker",
    sub: "saves from each paycheck",
    icon: icon(
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1-4 4-6 7-6s6 2 7 6" />
      </>,
    ),
  },
  {
    id: "menu",
    label: "401(k) menu",
    sub: "the options the employer offers",
    icon: icon(<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />),
  },
  {
    id: "tdf",
    label: "Target date fund",
    sub: "or a managed account",
    icon: icon(
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r="0.5" />
      </>,
    ),
  },
];

const SLEEVES = [
  { label: "Private equity", color: "var(--pe)" },
  { label: "Real assets", color: "var(--ra)" },
  { label: "Private credit", color: "var(--pc)" },
];

function Arrow() {
  return (
    <li aria-hidden className="flex items-center justify-center text-muted lg:px-1">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="rotate-90 lg:rotate-0">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </li>
  );
}

/** "How it gets into your 401(k)": a flow from worker to private funds, rewritten from the paper's p. 6. */
export default function HowItGetsIn({ audience }: { audience: AudienceId }) {
  const card = "flex items-center gap-3 rounded-card border border-line bg-bg-raised p-3 lg:flex-col lg:items-start lg:gap-2 lg:p-4";
  return (
    <section aria-labelledby="rp-how-h" className="space-y-4">
      <div>
        <h2 id="rp-how-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
          {audience === "worker" ? "How it would reach your 401(k)" : "How it would reach the plan"}
        </h2>
        <p className="mt-1 text-sm text-muted-strong">Not a fund a saver picks. A slice inside an option already on the menu.</p>
      </div>

      <ol aria-label="From worker to private funds" className="grid gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.4fr_auto_1.2fr] lg:items-stretch">
        {STEPS.map((s) => (
          <Fragment key={s.id}>
            <li className={card}>
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg text-accent">{s.icon}</span>
              <span>
                <span className="block text-sm font-medium text-ink">{s.label}</span>
                <span className="block text-xs text-muted-strong">{s.sub}</span>
              </span>
            </li>
            <Arrow />
          </Fragment>
        ))}
        <li className="flex flex-col justify-center gap-2 rounded-card border border-line bg-bg-raised p-3 lg:p-4">
          <span className="text-sm font-medium text-ink">Inside the fund</span>
          <span aria-hidden className="flex h-7 overflow-hidden rounded-md border border-line text-[11px] font-medium">
            <span className="flex items-center bg-bg px-2 text-muted-strong" style={{ width: `${100 - slice}%` }}>
              Public {100 - slice}%
            </span>
            <span className="flex items-center justify-center bg-accent text-accent-contrast" style={{ width: `${slice}%` }}>
              {slice}%
            </span>
          </span>
          <span className="text-xs text-muted-strong">Stocks and bonds, plus a private slice</span>
        </li>
        <Arrow />
        <li className="flex flex-col justify-center gap-2 rounded-card border border-line bg-bg-raised p-3 lg:p-4">
          <span className="text-sm font-medium text-ink">Private funds</span>
          <ul className="flex flex-wrap gap-x-3 gap-y-1">
            {SLEEVES.map((s) => (
              <li key={s.label} className="flex items-center gap-1.5 text-xs text-muted-strong">
                <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                {s.label}
              </li>
            ))}
          </ul>
        </li>
      </ol>

      <ul className="grid gap-3 md:grid-cols-3">
        {ROOM.howItGetsIn.points.map((p, i) => (
          <li key={p.text} className="flex gap-3 text-sm leading-relaxed text-ink">
            <span aria-hidden className="tnum flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line text-xs text-muted-strong">
              {i + 1}
            </span>
            <span>
              {p.text} <Cite source={p.source} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
