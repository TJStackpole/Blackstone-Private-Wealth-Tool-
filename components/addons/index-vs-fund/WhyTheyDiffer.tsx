import type { IndexVsFund } from "@/lib/addons/index-vs-fund/data";
import { FUNDS } from "@/lib/addons/shared/funds";

const lowerFirst = (t: string) => t.charAt(0).toLowerCase() + t.slice(1);

/** The reasons an index and a fund's share classes don't land on the same number, written for this fund. */
export function reasonsFor(d: IndexVsFund): { title: string; body: string }[] {
  const { index, fees, leverage } = d;
  const perfNote = fees.performance.note.charAt(0).toLowerCase() + fees.performance.note.slice(1);
  const label = FUNDS[d.fund].label;
  const out = [
    {
      title: "Fees",
      body:
        index.feeBasis === "gross"
          ? `The index takes no fees out. ${label} charges a ${fees.management.value}% management fee each year, plus ${fees.performance.label.toLowerCase()}: ${perfNote}`
          : `The index is already after its funds' fees, but those fees differ from ${label}'s: a ${fees.management.value}% management fee each year, plus ${fees.performance.label.toLowerCase()}: ${perfNote}`,
    },
    {
      title: "Borrowing (leverage)",
      body: `${index.leverageText} ${leverage ? leverage.text : `${label}'s filing reports borrowing at the level of its holdings, not as one fund-wide figure.`} Borrowing makes gains larger and losses larger.`,
    },
    {
      title: "Cash kept for redemptions",
      body: `${label} keeps some cash and easy-to-sell holdings so it can pay investors who ask to sell. That money usually earns less than the fund's main assets when markets rise, and cushions it when they fall.`,
    },
    {
      title: "Share-class servicing fees",
      body: `Class S pays an ongoing servicing fee of ${fees.servicing.S}% a year, Class D ${fees.servicing.D}%, and Class I ${fees.servicing.I === 0 ? "none" : `${fees.servicing.I}%`}. That's most of why the classes' returns differ from each other.`,
    },
    {
      title: "Appraisal timing",
      body: "Private assets are valued by appraisals and models, not daily trading. The index and the fund may value their holdings at different times and with different methods, so one can lag the other.",
    },
  ];
  const fundPeriod = d.fundSide.returns[0]?.period;
  if (index.return && fundPeriod && index.return.period !== fundPeriod)
    out.push({
      title: "Different periods",
      body: `The index figure covers ${lowerFirst(index.return.period)}; the fund's covers ${lowerFirst(fundPeriod)}. Put side by side, they're a starting point for the conversation, not a like-for-like score.`,
    });
  return out;
}

export default function WhyTheyDiffer({ data }: { data: IndexVsFund }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-2">
      {reasonsFor(data).map((r, i) => (
        <li key={r.title} className="rounded-card border border-line bg-bg-raised p-4 sm:p-5">
          <p className="text-sm font-medium text-ink">
            <span className="tnum mr-2 text-muted">{i + 1}</span>
            {r.title}
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-strong">{r.body}</p>
        </li>
      ))}
    </ol>
  );
}
