import { COMPARE } from "@/lib/addons/drawdown-vs-evergreen/data";
import type { AddonSource } from "@/lib/addons/shared/types";

function Sources({ list }: { list: AddonSource[] }) {
  return (
    <span className="text-xs text-muted">
      {list.map((s, i) => (
        <span key={s.url}>
          {i > 0 && " · "}
          <a href={s.url} {...(s.url.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})} className="underline decoration-line underline-offset-2 hover:text-ink">
            {s.name.split(",")[0]}
          </a>
        </span>
      ))}
    </span>
  );
}

/** The two structures side by side, topic by topic, each row with its sources. */
export default function CompareTable() {
  return (
    <>
      <ul className="space-y-3 md:hidden print:hidden">
        {COMPARE.rows.map((r) => (
          <li key={r.topic} className="space-y-2 rounded-card border border-line bg-bg-raised p-4 sm:p-5 text-sm">
            <p className="font-medium text-ink">{r.topic}</p>
            <p className="text-muted-strong">
              <span className="text-[11px] uppercase tracking-[0.08em] text-muted">Drawdown · </span>
              {r.drawdown}
            </p>
            <p className="text-muted-strong">
              <span className="text-[11px] uppercase tracking-[0.08em] text-muted">Evergreen · </span>
              {r.evergreen}
            </p>
            <Sources list={r.sources} />
          </li>
        ))}
      </ul>
      <div className="hidden overflow-hidden rounded-card border border-line md:block print:block">
        <table className="w-full text-left text-sm print:text-[10px]">
          <caption className="sr-only">Drawdown fund vs. evergreen fund</caption>
          <thead className="bg-bg-raised text-[11px] uppercase tracking-[0.08em] text-muted">
            <tr>
              <th scope="col" className="w-[16%] px-3 py-2 font-medium">Topic</th>
              <th scope="col" className="w-[42%] px-3 py-2 font-medium">Traditional drawdown fund</th>
              <th scope="col" className="w-[42%] px-3 py-2 font-medium">Evergreen fund (e.g. {COMPARE.evergreenExample})</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line align-top">
            {COMPARE.rows.map((r) => (
              <tr key={r.topic}>
                <th scope="row" className="px-3 py-2.5 font-medium text-ink print:py-1">
                  {r.topic}
                  <span className="mt-1 block font-normal print:hidden">
                    <Sources list={r.sources} />
                  </span>
                </th>
                <td className="px-3 py-2.5 leading-relaxed text-muted-strong print:py-1 print:leading-snug">{r.drawdown}</td>
                <td className="px-3 py-2.5 leading-relaxed text-muted-strong print:py-1 print:leading-snug">{r.evergreen}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
