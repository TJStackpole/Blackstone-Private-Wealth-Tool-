import type { IndexVsFund } from "@/lib/addons/index-vs-fund/data";
import { FUNDS } from "@/lib/addons/shared/funds";

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** The reasons an index and a fund's share classes don't land on the same number, written for this fund. */
export function reasonsFor(d: IndexVsFund): { title: string; short: string; body: string }[] {
  const { index, fees, leverage } = d;
  const perfNote = fees.performance.note.charAt(0).toLowerCase() + fees.performance.note.slice(1);
  const label = FUNDS[d.fund].label;
  const out = [
    {
      title: "Fees",
      short:
        index.feeBasis === "gross"
          ? `The index takes no fees out. The fund charges ${fees.management.value}% a year, plus a performance fee.`
          : "The index is after other funds' fees, which aren't this fund's fees.",
      body:
        index.feeBasis === "gross"
          ? `The index takes no fees out. ${label} charges a ${fees.management.value}% management fee each year, plus ${fees.performance.label.toLowerCase()}: ${perfNote}`
          : `The index is already after its funds' fees, but those fees differ from ${label}'s: a ${fees.management.value}% management fee each year, plus ${fees.performance.label.toLowerCase()}: ${perfNote}`,
    },
    {
      title: "Borrowing (leverage)",
      short: "Borrowing makes both gains and losses bigger.",
      body: `${index.leverageText} ${leverage ? leverage.text : `${label}'s filing reports borrowing at the level of its holdings, not as one fund-wide figure.`} Borrowing makes gains larger and losses larger.`,
    },
    {
      title: "Cash kept for redemptions",
      short: "Cash set aside to pay sellers earns less when markets rise.",
      body: `${label} keeps some cash and easy-to-sell holdings so it can pay investors who ask to sell. That money usually earns less than the fund's main assets when markets rise, and cushions it when they fall.`,
    },
    {
      title: "Share-class servicing fees",
      short: `Class S pays ${fees.servicing.S}% a year, Class D ${fees.servicing.D}%, Class I ${fees.servicing.I === 0 ? "none" : `${fees.servicing.I}%`}.`,
      body: `Class S pays an ongoing servicing fee of ${fees.servicing.S}% a year, Class D ${fees.servicing.D}%, and Class I ${fees.servicing.I === 0 ? "none" : `${fees.servicing.I}%`}. That's most of why the classes' returns differ from each other.`,
    },
    {
      title: "Appraisal timing",
      short: "Values come from appraisals, set at different times.",
      body: "Private assets are valued by appraisals and models, not daily trading. The index and the fund may value their holdings at different times and with different methods, so one can lag the other.",
    },
  ];
  const fundPeriod = d.fundSide.returns[0]?.period;
  if (index.return && fundPeriod && index.return.period !== fundPeriod)
    out.push({
      title: "Different periods",
      short: "The two numbers cover different stretches of time.",
      body: `The index figure covers ${lowerFirst(index.return.period)}; the fund's covers ${lowerFirst(fundPeriod)}. Put side by side, they're a starting point for the conversation, not a like-for-like score.`,
    });
  return out;
}

const ICONS: Record<string, React.ReactNode> = {
  Fees: <path d="M6 18 18 6M7.5 8.5h.01M16.5 15.5h.01" />,
  "Borrowing (leverage)": <path d="M3 18h18M7 18l10-9M15 6h4v4" />,
  "Cash kept for redemptions": (
    <>
      <rect x="3" y="7" width="18" height="11" rx="2" />
      <circle cx="12" cy="12.5" r="2.5" />
    </>
  ),
  "Share-class servicing fees": <path d="M4 12V5h7l9 9-7 7-9-9zM8 8.5h.01" />,
  "Appraisal timing": (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  "Different periods": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
};

/** Each reason as a card: a picture, a one-line summary, and the full explanation behind "More". */
export default function WhyTheyDiffer({ data }: { data: IndexVsFund }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {reasonsFor(data).map((r) => (
        <li key={r.title} className="flex flex-col gap-2 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
          <span aria-hidden className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-bg text-accent">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              {ICONS[r.title]}
            </svg>
          </span>
          <p className="font-medium leading-snug text-ink">{r.title}</p>
          <p className="text-sm leading-relaxed text-muted-strong">{r.short}</p>
          <details className="group mt-auto text-sm">
            <summary className="tap inline-flex cursor-pointer list-none items-center gap-1 text-xs font-medium text-muted-strong hover:text-ink [&::-webkit-details-marker]:hidden">
              <span className="group-open:hidden">More</span>
              <span className="hidden group-open:inline">Less</span>
            </summary>
            <p className="mt-1 leading-relaxed text-muted-strong">{r.body}</p>
          </details>
        </li>
      ))}
    </ul>
  );
}
