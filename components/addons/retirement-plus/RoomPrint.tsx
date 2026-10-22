"use client";

import { ADDON_DISCLOSURE } from "@/components/addons/shared/AddonDisclosure";
import PrintOnePager from "@/components/addons/shared/PrintOnePager";
import { GAP, MODEL, ROOM, type AudienceId, type Source } from "@/lib/addons/retirement-plus/data";
import { premiumSensitivity, projectRetirement, type LabParams } from "@/lib/addons/retirement-plus/model";
import { short, signed } from "@/lib/addons/retirement-plus/format";

const P = MODEL.published;
const names = (s: Source[]) => s.map((x) => (x.name.startsWith("Blackstone, Expanding") ? `Blackstone paper${x.page ? `, ${x.page}` : ""}` : x.name.split(",")[0])).join("; ");

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
            Share of assets in private markets: {pensions.label} about {pensions.value}%, {dc.label} about {dc.value}% (Blackstone paper, {pensions.source.page}).
          </p>
        </section>

        <section>
          <h2 className="text-[11px] font-semibold">Outcome Lab: your assumptions · Illustrative · Hypothetical</h2>
          {valid ? (
            <>
              <p>
                At {lab.retireAge}: {short(r.endPublicOnly)} public only vs. {short(r.endWithPrivate)} with a {lab.privatePct}% private slice ({signed(r.difference)}). Income at{" "}
                {lab.withdrawalPct}% a year: {short(r.incomePublicOnly)} vs. {short(r.incomeWithPrivate)}.
              </p>
              <p>
                Worker: age {lab.startAge} to {lab.retireAge}, ${lab.startSalary.toLocaleString("en-US")} salary, {lab.raisePct}% raises, saving {lab.contribStartPct}% rising to{" "}
                {lab.contribEndPct}%. Markets: public {lab.publicReturnPct}% a year; private beats public by {pm.privateEquity}% (equity), {pm.privateRealAssets}% (real assets),{" "}
                {pm.privateCredit}% (credit); extra private fees {lab.privateFeePct}%.
              </p>
            </>
          ) : (
            <p>Retirement age needs to be after the starting age.</p>
          )}
          <p>
            The paper&apos;s published result: {short(P.withPrivate)} vs. {short(P.publicOnly)} at 65, {short(P.incomeWithPrivate)} vs. {short(P.incomePublicOnly)} a year (Blackstone paper,{" "}
            {P.source.page}). {P.method} This calculator is not the paper&apos;s model.
          </p>
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
                  <span className="font-medium">Concern.</span> {o.concern.text} <span className="italic">({names(o.concern.sources)})</span>
                </p>
                <p>
                  <span className="font-medium">Response.</span> {o.response.text} <span className="italic">({names(o.response.sources)})</span>
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
          <p>
            Independent prototype built from public sources. Not affiliated with or endorsed by Blackstone. Explains concepts only; it does not suggest what to choose. Sources and
            the full paper: {P.source.url}
          </p>
        </footer>
      </div>
    </PrintOnePager>
  );
}
