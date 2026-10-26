"use client";

import { useId, useMemo, type ReactNode } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MODEL } from "@/lib/addons/retirement-plus/data";
import { PAPER_DEFAULTS } from "@/lib/addons/retirement-plus/defaults";
import { premiumSensitivity, projectRetirement, type LabParams } from "@/lib/addons/retirement-plus/model";
import { IllustrativeBadge } from "@/components/addons/shared/Badges";
import { NumberInput } from "@/components/addons/shared/Inputs";
import { money, short, shortPair, signed } from "@/lib/addons/retirement-plus/format";
import Cite from "./Cite";
import HypotheticalBadge from "./HypotheticalBadge";
import MoreDetails from "@/components/addons/shared/MoreDetails";

const P = MODEL.published;
const PREMIUMS = [0, 1, 2, 3];

/** Round-number axis steps: 1, 2, 2.5 or 5 times a power of ten. */
function niceTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((x) => x >= raw)!;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

function Group({ title, note, children }: { title: string; note: ReactNode; children: ReactNode }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">{title}</legend>
      <div className="grid grid-cols-2 gap-3">{children}</div>
      <p className="text-xs leading-relaxed text-muted">{note}</p>
    </fieldset>
  );
}

/**
 * Outcome Lab (BUILD_PLAN_401K.md, Phase 2): the paper's worker, rebuilt with returns the reader can change, beside the
 * paper's own published result. Not the paper's model: it used historical index returns this tool doesn't have.
 */
export default function OutcomeLab({ params, onChange }: { params: LabParams; onChange: (p: LabParams) => void }) {
  const sliceId = useId();
  const set = (patch: Partial<LabParams>) => onChange({ ...params, ...patch });
  const setPremium = (k: keyof LabParams["premiumPct"]) => (v: number) => set({ premiumPct: { ...params.premiumPct, [k]: v } });
  const r = useMemo(() => projectRetirement(params), [params]);
  const [pubText, privText] = shortPair(r.endPublicOnly, r.endWithPrivate);
  const strip = useMemo(() => premiumSensitivity(params, PREMIUMS), [params]);
  const valid = params.retireAge > params.startAge;
  const data = r.years.map((y) => ({ age: y.age, publicOnly: Math.round(y.publicOnly), withPrivate: Math.round(y.withPrivate), gap: [Math.round(y.publicOnly), Math.round(y.withPrivate)] }));
  const showPaper = valid && params.startAge <= 65 && params.retireAge >= 65;
  const yTicks = niceTicks(Math.max(r.endPublicOnly, r.endWithPrivate, showPaper ? P.withPrivate : 0));
  const pm = params.premiumPct;
  const uniform = pm.privateEquity === pm.privateRealAssets && pm.privateRealAssets === pm.privateCredit ? pm.privateEquity : null;
  const stripMax = Math.max(1, ...strip.map((s) => Math.abs(s.difference)));
  const incomeMax = Math.max(1, r.incomePublicOnly, r.incomeWithPrivate);
  const isDefault = JSON.stringify({ ...params, rows: 0 }) === JSON.stringify({ ...PAPER_DEFAULTS, rows: 0 });

  return (
    <section aria-labelledby="rp-lab-h" className="space-y-6">
      <div>
        <h2 id="rp-lab-h" className="font-serif text-[24px] font-medium leading-tight text-ink">
          What could a private slice add?
        </h2>
        <p className="mt-1 text-sm text-muted-strong">The paper&apos;s answer first. Then change the assumptions and see how much it moves.</p>
      </div>

      {/* The headline is the paper's own published result; the tool's figures come after, as "your version". */}
      <div className="grid gap-4 rounded-card border border-line bg-bg-raised p-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-8 sm:p-6" data-paper-headline>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">The paper&apos;s worker: yearly income in retirement</p>
          <p className="tnum mt-1 font-serif text-[34px] leading-none text-ink sm:text-[44px]">
            {short(P.incomeWithPrivate)}
            <span className="mx-2 text-[22px] text-muted sm:text-[26px]">vs.</span>
            <span className="text-muted-strong">{short(P.incomePublicOnly)}</span>
            <span className="ml-2 font-sans text-sm text-muted">a year</span>
          </p>
          <p className="mt-2 text-sm text-muted-strong">
            With a {MODEL.assumptions.privatePct.value}% private slice vs. public stocks and bonds only: about {P.incomeIncreasePct}% more a year.
          </p>
          <p className="tnum mt-1 text-xs text-muted">
            Balance at 65: {short(P.withPrivate)} vs. {short(P.publicOnly)}.
          </p>
        </div>
        <div className="space-y-1.5 border-line text-xs leading-relaxed text-muted sm:border-l sm:pl-8">
          <p>
            Published result, not this tool&apos;s estimate. <Cite source={P.source} />
          </p>
          <p>{P.method}</p>
          <p data-verify>{MODEL.verify}</p>
        </div>
      </div>

      <div className="grid gap-6 rounded-card border border-line p-4 sm:p-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)] lg:gap-10">
        {/* Assumptions */}
        <form className="space-y-6" onSubmit={(e) => e.preventDefault()} aria-label="Assumptions">
          <Group
            title="About the worker"
            note={
              <>
                Starting values: the paper&apos;s worker. <Cite source={MODEL.assumptions.startSalary.source} />
              </>
            }
          >
            <NumberInput label="Starting age" value={params.startAge} onChange={(v) => set({ startAge: Math.round(v) })} min={18} max={70} />
            <NumberInput label="Retirement age" value={params.retireAge} onChange={(v) => set({ retireAge: Math.round(v) })} min={19} max={80} />
            <NumberInput label="Starting salary" value={params.startSalary} onChange={(v) => set({ startSalary: v })} min={0} max={5_000_000} step={1000} prefix="$" />
            <NumberInput label="Yearly raise" value={params.raisePct} onChange={(v) => set({ raisePct: v })} min={-10} max={20} step={0.5} suffix="%" />
            <NumberInput label="Saves at start" value={params.contribStartPct} onChange={(v) => set({ contribStartPct: v })} min={0} max={100} step={0.1} suffix="%" />
            <NumberInput label="Saves by retirement" value={params.contribEndPct} onChange={(v) => set({ contribEndPct: v })} min={0} max={100} step={0.1} suffix="%" />
            <NumberInput label="Withdrawal rate" value={params.withdrawalPct} onChange={(v) => set({ withdrawalPct: v })} min={0} max={20} step={0.5} suffix="%" />
          </Group>

          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">About the markets</legend>
            <div className="space-y-2">
              <label htmlFor={sliceId} className="flex items-baseline justify-between text-xs font-medium text-muted-strong">
                Private slice
                <span className="tnum font-serif text-2xl leading-none text-ink">{params.privatePct}%</span>
              </label>
              <input
                id={sliceId}
                type="range"
                min={0}
                max={30}
                step={1}
                value={params.privatePct}
                onChange={(e) => set({ privatePct: Number(e.target.value) })}
                aria-valuetext={`${params.privatePct}% private`}
                className="glide-slider w-full"
                style={{ ["--pct" as string]: `${(params.privatePct / 30) * 100}%` }}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberInput label="Public return a year" value={params.publicReturnPct} onChange={(v) => set({ publicReturnPct: v })} min={-10} max={20} step={0.1} suffix="%" />
              <NumberInput label="Extra fees, private" value={params.privateFeePct} onChange={(v) => set({ privateFeePct: v })} min={0} max={5} step={0.1} suffix="%" />
            </div>
            <p className="pt-1 text-xs font-medium text-muted-strong">Private beats public by, a year:</p>
            <div className="grid grid-cols-3 gap-3">
              <NumberInput label="Equity" value={pm.privateEquity} onChange={setPremium("privateEquity")} min={-10} max={20} step={0.5} suffix="%" />
              <NumberInput label="Real assets" value={pm.privateRealAssets} onChange={setPremium("privateRealAssets")} min={-10} max={20} step={0.5} suffix="%" />
              <NumberInput label="Credit" value={pm.privateCredit} onChange={setPremium("privateCredit")} min={-10} max={20} step={0.5} suffix="%" />
            </div>
            <p className="text-xs leading-relaxed text-muted">Returns are this tool&apos;s starting guesses, not the paper&apos;s, set so the base case lands near its result.</p>
          </fieldset>

          <button
            type="button"
            onClick={() => onChange(PAPER_DEFAULTS)}
            disabled={isDefault}
            className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-sm font-medium text-ink hover:border-muted disabled:cursor-default disabled:opacity-50"
          >
            Reset to paper&apos;s assumptions
          </button>
        </form>

        {/* Results */}
        <div className="order-first min-w-0 space-y-6 lg:order-none">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">Your version at {params.retireAge}</p>
            <div className="flex gap-2">
              <IllustrativeBadge />
              <HypotheticalBadge />
            </div>
          </div>
          <p className="-mt-3 text-xs text-muted">Not the paper&apos;s model: it copies the structure and lets you pick the returns.</p>

          {!valid ? (
            <p role="status" className="rounded-card border border-line bg-bg-raised p-4 text-sm text-ink">
              Retirement age needs to be after the starting age.
            </p>
          ) : (
            <>
              <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3" aria-live="polite">
                <div className="rounded-card border border-line bg-bg-raised p-3 sm:p-4">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-strong">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-muted" />
                    Public only
                  </dt>
                  <dd className="tnum mt-1 font-serif text-2xl leading-none text-ink sm:text-[30px]" data-lab="public">
                    {pubText}
                  </dd>
                </div>
                <div className="rounded-card border border-line bg-bg-raised p-3 sm:p-4">
                  <dt className="flex items-center gap-1.5 text-xs text-muted-strong">
                    <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                    With {params.privatePct}% private
                  </dt>
                  <dd className="tnum mt-1 font-serif text-2xl leading-none text-ink sm:text-[30px]" data-lab="private">
                    {privText}
                  </dd>
                </div>
                <div className="col-span-2 rounded-card border border-accent/40 bg-bg-raised p-3 sm:col-span-1 sm:p-4">
                  <dt className="text-xs text-muted-strong">Difference</dt>
                  <dd className="tnum mt-1 font-serif text-2xl leading-none text-ink sm:text-[30px]" data-lab="difference">
                    {signed(r.difference)}
                  </dd>
                </div>
              </dl>

              <figure className="space-y-2">
                <div
                  className="h-64"
                  role="img"
                  aria-label={`Balance from age ${params.startAge} to ${params.retireAge}: public only ends at ${pubText}, with the private slice at ${privText}.${showPaper ? ` The paper's published result at 65: ${short(P.withPrivate)} vs. ${short(P.publicOnly)}.` : ""}`}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart accessibilityLayer={false} data={data} margin={{ top: 12, right: 16, bottom: 0, left: 0 }}>
                      <CartesianGrid vertical={false} stroke="var(--border)" />
                      <XAxis dataKey="age" type="number" domain={[params.startAge, params.retireAge]} allowDecimals={false} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                      <YAxis domain={[0, yTicks.at(-1)!]} ticks={yTicks} tickFormatter={(v: number) => short(v)} tick={{ fill: "var(--muted)", fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                      <Tooltip
                        formatter={(v, name) => [money(Number(v)), name]}
                        labelFormatter={(a) => `Age ${a}`}
                        contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                      />
                      <Area dataKey="gap" stroke="none" fill="var(--accent)" fillOpacity={0.12} tooltipType="none" activeDot={false} isAnimationActive={false} />
                      <Line dataKey="publicOnly" name="Public only" stroke="var(--muted)" strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} />
                      <Line dataKey="withPrivate" name="With private slice" stroke="var(--accent)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                      {showPaper &&
                        [P.publicOnly, P.withPrivate].map((y) => (
                          <ReferenceDot key={y} x={65} y={y} r={6} fill="var(--bg)" stroke="var(--text)" strokeWidth={1.5} strokeDasharray="2 2" />
                        ))}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
                <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="w-4 border-t-2 border-dashed border-muted" /> Public only
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="h-0.5 w-4 bg-accent" /> With private slice
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="h-3 w-4 bg-accent/15" /> The extra
                  </span>
                  {showPaper && (
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className="h-3 w-3 rounded-full border-[1.5px] border-dotted border-ink" />
                      Paper&apos;s published result: {short(P.withPrivate)} vs. {short(P.publicOnly)} ({P.source.page})
                    </span>
                  )}
                </figcaption>
              </figure>

              {/* The tool's own income figures sit behind a toggle so they don't read as a second answer next to the paper's. */}
              <MoreDetails summary="See how this changes with your inputs" hint={`Yearly income at ${params.withdrawalPct}% a year, from your version above`}>
                <div className="space-y-3" data-lab-income>
                  {[
                    { label: "Public only", v: r.incomePublicOnly, cls: "bg-muted/60" },
                    { label: "With private slice", v: r.incomeWithPrivate, cls: "bg-accent" },
                  ].map((b) => (
                    <div key={b.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
                      <span className="text-xs text-muted-strong sm:order-none">{b.label}</span>
                      <span className="col-span-2 row-start-2 h-3 overflow-hidden rounded-sm bg-bg sm:col-span-1 sm:row-start-auto">
                        <span className={`block h-full rounded-sm ${b.cls}`} style={{ width: `${Math.max(0, (b.v / incomeMax) * 100)}%` }} />
                      </span>
                      <span className="tnum text-right text-sm text-ink" data-lab={b.label === "Public only" ? "income-public" : "income-private"}>
                        {short(b.v)}
                      </span>
                    </div>
                  ))}
                  {r.incomePublicOnly > 0 && (
                    <p className="tnum text-sm text-ink">
                      About{" "}
                      <strong className="font-semibold">{Math.abs(r.incomeIncreasePct).toFixed(0)}% {r.incomeIncreasePct >= 0 ? "more" : "less"}</strong> a year with the private slice.
                    </p>
                  )}
                  <p className="text-xs leading-relaxed text-muted">
                    Why this differs from the paper&apos;s {short(P.incomeWithPrivate)} vs. {short(P.incomePublicOnly)}: the paper uses its own income method ({P.source.page}); this tool takes a plain{" "}
                    {params.withdrawalPct}% of the balance each year. Social Security is left out, as in the paper.
                  </p>
                </div>
              </MoreDetails>
            </>
          )}
        </div>
      </div>

      {/* How much rides on the premium? */}
      {valid && (
        <div className="space-y-3">
          <div>
            <h3 className="font-serif text-xl font-medium leading-tight text-ink">How much rides on the premium?</h3>
            <p className="mt-1 text-sm text-muted-strong">If private markets only match public markets, the extra shrinks to $0. Fees push it below zero.</p>
          </div>
          <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={`Extra at ${params.retireAge} by premium`}>
            {strip.map((s) => {
              const on = uniform === s.premium;
              const h = (Math.abs(s.difference) / stripMax) * 100;
              return (
                <li
                  key={s.premium}
                  data-premium={s.premium}
                  aria-current={on ? "true" : undefined}
                  className={`flex flex-col gap-3 rounded-card border p-4 ${on ? "border-accent bg-bg-raised" : "border-line"}`}
                >
                  <div aria-hidden className="flex h-16 items-end border-b border-line">
                    <span
                      className={`block w-full rounded-sm ${s.difference < 0 ? "bg-muted" : "bg-accent"}`}
                      style={{ height: `${Math.max(Math.abs(s.difference) < 500 ? 0 : 4, h)}%`, opacity: s.difference < 0 ? 0.5 : 0.35 + 0.65 * (h / 100) }}
                    />
                  </div>
                  <div>
                    <p className="tnum font-serif text-2xl leading-none text-ink">{signed(s.difference)}</p>
                    <p className="mt-1 text-xs text-muted-strong">
                      if private beats public by <span className="tnum font-medium text-ink">{s.premium}%</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="text-xs text-muted">
            Extra at {params.retireAge}. Same premium for all three types; your worker, slice and fees stay as set. Set all three premiums to one of these to match the chart.
          </p>
        </div>
      )}

      {/* Assumption check */}
      <MoreDetails summary="Assumption check" hint="The paper's own caveats, in plain words">
        <ul className="grid gap-3 sm:grid-cols-2">
          {MODEL.notes.map((n) => (
            <li key={n} className="flex gap-3 text-sm leading-relaxed text-ink">
              <span aria-hidden className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-line text-[11px] font-semibold text-muted-strong">
                !
              </span>
              {n}
            </li>
          ))}
        </ul>
      </MoreDetails>
    </section>
  );
}
