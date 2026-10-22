"use client";

import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { GAP, MODEL, ROOM, type AudienceId, type Source } from "@/lib/addons/retirement-plus/data";
import { premiumSensitivity, projectRetirement, type LabParams } from "@/lib/addons/retirement-plus/model";
import { short, signed } from "@/lib/addons/retirement-plus/format";
import { fundFees } from "./FundFees";

const P = MODEL.published;
const names = (s: Source[]) => s.map((x) => (x.name.startsWith("Blackstone, Expanding") ? `Blackstone paper (2026)${x.page ? `, ${x.page}` : ""}` : x.name.split(",")[0])).join("; ");

/** The 401(k) one-pager, per audience: the gap, the reader's Lab result, the premium table, three concerns, the disclosure. */
export default function RoomPrint({ audience, lab }: { audience: AudienceId; lab: LabParams }) {
  const a = ROOM.audiences[audience];
  const r = projectRetirement(lab);
  const strip = premiumSensitivity(lab);
  const valid = lab.retireAge > lab.startAge;
  const top = a.printTop.map((id) => ROOM.objections.find((o) => o.id === id)!).filter(Boolean);
  const { pensions, dc } = GAP.headline;
  const pm = lab.premiumPct;
  return (
    <PrintOnePager title={`401(k) one-pager for ${a.label.toLowerCase()}s`} screen={false}>
      <div className="space-y-3 text-[11.5px] leading-snug">
        <header className="border-b pb-2">
          <p className="text-[9px] uppercase tracking-[0.12em]">Private markets in a 401(k) · {a.label} view</p>
          <h1 className="font-serif text-[22px] leading-tight">{a.title}</h1>
          <p>{a.lede}</p>
        </header>

        <section>
          <h2 className="text-[11px] font-semibold">The gap</h2>
          <p>
            Share of assets in private markets: {pensions.label} about {pensions.value}%, {dc.label} about {dc.value}% (Blackstone paper (2026), {pensions.source.page}).
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold">The paper&apos;s result</h2>
          <p>
            <span className="font-serif text-[15px]">
              {short(P.incomeWithPrivate)} vs. {short(P.incomePublicOnly)} a year in retirement
            </span>{" "}
            with a {MODEL.assumptions.privatePct.value}% private slice vs. public only, about {P.incomeIncreasePct}% more; {short(P.withPrivate)} vs. {short(P.publicOnly)} at 65 (Blackstone paper (2026), {P.source.page}). {P.method}
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold">Your version: your assumptions · Illustrative · Hypothetical</h2>
          {valid ? (
            <>
              <p>
                At {lab.retireAge}: {short(r.endPublicOnly)} public only vs. {short(r.endWithPrivate)} with a {lab.privatePct}% private slice ({signed(r.difference)}).
              </p>
              <p>
                Worker: age {lab.startAge} to {lab.retireAge}, ${lab.startSalary.toLocaleString("en-US")} salary, {lab.raisePct}% raises, saving {lab.contribStartPct}% rising to{" "}
                {lab.contribEndPct}%. Markets: public {lab.publicReturnPct}% a year; private beats public by {pm.privateEquity}% (equity), {pm.privateRealAssets}% (real assets),{" "}
                {pm.privateCredit}% (credit); extra private fees {lab.privateFeePct}%. This calculator is not the paper&apos;s model.
              </p>
            </>
          ) : (
            <p>Retirement age needs to be after the starting age.</p>
          )}
          {valid && (
            <table className="mt-1 w-full border text-left">
              <caption className="text-left">How much rides on the premium: extra at {lab.retireAge} if private beats public by…</caption>
              <tbody>
                <tr>
                  {strip.map((s) => (
                    <td key={s.premium} className="border px-2 py-0.5">
                      {s.premium}%: {signed(s.difference)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </section>

        <section className="space-y-1.5">
          <h2 className="text-[11px] font-semibold">{a.concernsTitle}</h2>
          {top.map((o) => (
            <div key={o.id} className="border-t pt-1">
              <p className="font-semibold">
                {o.title}: {o.question}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <p>
                  <span className="font-medium">Short answer.</span> {o.response.text} <span className="italic">({names(o.response.sources)})</span>
                </p>
                <p>
                  <span className="font-medium">Keep in mind.</span> {o.concern.text}{" "}
                  {o.concern.perFund === "fees" ? (
                    fundFees().map((f) => (
                      <span key={f.fund} className="block">
                        {f.label}: {f.management.value} {f.management.note}, {f.performance.value} performance fee{" "}
                        <span className="italic">({f.management.sources?.[0]?.name.replace(/, (quarter|year) ended .*$/, "")}, {f.management.sources?.[0]?.page?.split(":")[0]})</span>
                      </span>
                    ))
                  ) : (
                    <span className="italic">({names(o.concern.sources)})</span>
                  )}
                </p>
              </div>
              <p>
                <span className="font-medium">Watch:</span> {o.watch}
              </p>
            </div>
          ))}
        </section>

        <footer className="border-t pt-1.5 text-[9px]">
          <p>{ADDON_DISCLOSURE}</p>
          <p>{MODEL.verify}</p>
          <p>
            Independent prototype built from public sources. Not affiliated with or endorsed by Blackstone. Explains concepts only; it does not suggest what to choose. Sources and
            the full paper: {P.source.url}
          </p>
        </footer>
      </div>
    </PrintOnePager>
  );
}
