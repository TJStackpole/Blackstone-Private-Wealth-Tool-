"use client";

import type { LayerDef } from "@/lib/types";
import { addonHref, toolkitAddons, findAddon } from "@/config/addons";
import ViewLink from "./ViewLink";
import InlineChat from "./chat/InlineChat";

const card = "flex flex-col rounded-card border border-line bg-bg-raised p-4 sm:p-5";
const step = "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-serif text-sm text-muted-strong";

/**
 * Where the site opens: three ways in (one fund, the funds side by side, a client's question) and, below them, the AI
 * assistant with ready-made questions. No figures of its own; each path leads to sourced ones.
 */
export default function StartScreen({ layers }: { layers: LayerDef[] }) {
  const funds = layers.filter((l) => l.data && l.status === "active");
  const tools = [...toolkitAddons(), ...[findAddon("retirement-plus")].filter((a) => !!a)];
  return (
    <section aria-labelledby="start-h" className="space-y-6" data-start>
      <div>
        <h2 id="start-h" tabIndex={-1} className="font-serif text-[28px] font-medium leading-[1.1] tracking-[-0.01em] text-ink outline-none sm:text-[32px]">
          Start here
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-strong">
          Pick what you need for the client in front of you. Every figure on this site comes from the funds&rsquo; SEC filings, with its
          date and source.
        </p>
      </div>

      <ol className="grid gap-3 lg:grid-cols-3">
        <li className={card} data-path="fund">
          <div className="flex items-center gap-3">
            <span aria-hidden className={step}>
              1
            </span>
            <h3 className="text-lg font-medium text-ink">Explain one fund</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-strong">
            Five plain answers: what it is, what it pays, getting money out, what changed and the main risk.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {funds.map((l) => (
              <li key={l.id} style={{ ["--tab-light" as string]: l.color, ["--tab-dark" as string]: l.colorDark }}>
                <ViewLink
                  href={`/?view=${l.id}`}
                  className="tap flex h-full flex-col rounded-md border border-line bg-bg px-3 py-2.5 hover:border-muted"
                >
                  <span className="flex items-center gap-2 text-sm font-medium text-ink">
                    <span aria-hidden className="tab-dot inline-block h-2 w-2 shrink-0 rounded-full" />
                    {l.fund}
                  </span>
                  <span className="mt-0.5 text-xs text-muted">{l.label}</span>
                </ViewLink>
              </li>
            ))}
          </ul>
        </li>

        <li className={card} data-path="compare">
          <div className="flex items-center gap-3">
            <span aria-hidden className={step}>
              2
            </span>
            <h3 className="text-lg font-medium text-ink">Compare the funds</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-strong">
            Pick two or more and see size, value per share, payouts, fees and buyback terms side by side.
          </p>
          <ViewLink
            href="/?view=all"
            className="tap mt-auto inline-flex h-11 items-center justify-center self-start rounded-full bg-accent px-5 text-sm font-medium text-accent-contrast hover:opacity-90 max-lg:mt-4"
          >
            Open the comparison →
          </ViewLink>
        </li>

        <li className={card} data-path="question">
          <div className="flex items-center gap-3">
            <span aria-hidden className={step}>
              3
            </span>
            <h3 className="text-lg font-medium text-ink">Answer a client question</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-strong">Each tool works through one question, for your client.</p>
          <ul className="mt-3 divide-y divide-line">
            {tools.map((a) => (
              <li key={a.id}>
                <ViewLink href={addonHref(a)} className="group flex items-center gap-3 py-2 text-sm text-ink">
                  <span className="flex-1 group-hover:text-accent">{a.question ?? a.name}</span>
                  <span aria-hidden className="text-muted transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                </ViewLink>
              </li>
            ))}
          </ul>
        </li>
      </ol>

      <InlineChat />
    </section>
  );
}
