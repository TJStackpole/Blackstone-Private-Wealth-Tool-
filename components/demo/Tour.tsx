"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { SHORT_STEPS, STEPS, type TourStep } from "@/lib/demo/steps";
import ScaledFrame from "./ScaledFrame";

const AUTOPLAY_MS = 12_000;

type Length = "short" | "full";
const noop = () => () => {};

/** Short tour (6 steps) by default; ?tour=full opens the full one. The switch keeps the address in step so it can be shared. */
export default function TourPicker() {
  const search = useSyncExternalStore(noop, () => window.location.search, () => "");
  const [picked, setPicked] = useState<Length | null>(null);
  const length: Length = picked ?? (new URLSearchParams(search).get("tour") === "full" ? "full" : "short");
  function pick(next: Length) {
    setPicked(next);
    window.history.replaceState(null, "", next === "full" ? "?tour=full" : window.location.pathname);
  }
  const options: { id: Length; label: string }[] = [
    { id: "short", label: `Short tour · ${SHORT_STEPS.length} steps` },
    { id: "full", label: `Full tour · ${STEPS.length} steps` },
  ];
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div role="group" aria-label="Tour length" className="tap inline-flex h-9 shrink-0 items-center self-start rounded-full border border-line bg-bg-raised p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={length === o.id}
            onClick={() => pick(o.id)}
            className={[
              "tap-sm h-8 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors",
              length === o.id ? "bg-accent text-accent-contrast" : "text-muted-strong hover:text-ink",
            ].join(" ")}
          >
            {o.label}
          </button>
        ))}
      </div>
      <Tour key={length} steps={length === "full" ? STEPS : SHORT_STEPS} onFullTour={length === "short" ? () => pick("full") : undefined} />
    </div>
  );
}

/**
 * The guided tour: the step on the left with Back / Next, autoplay and the step list; the live page on the right.
 * On wide screens it fills the window and nothing but the step list scrolls. Narrower, the live page sits under the
 * step, then the list.
 */
function Tour({ steps, onFullTour }: { steps: TourStep[]; onFullTour?: () => void }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = steps[i];
  const last = steps.length - 1;

  function go(n: number, focus = true) {
    const next = Math.max(0, Math.min(last, n));
    setI(next);
    if (focus) requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
  }

  // Autoplay moves on every few seconds and stops at the last step.
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => {
      if (i >= last) setPlaying(false);
      else setI(i + 1);
    }, AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [playing, i, last]);

  // Left and right arrow keys step through the tour (when focus isn't in a form field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") setI((n) => Math.min(last, n + 1));
      if (e.key === "ArrowLeft") setI((n) => Math.max(0, n - 1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [last]);

  // On wide screens the step list scrolls on its own; the current step stays in view in it as the tour moves on.
  const list = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = list.current?.querySelector<HTMLElement>('[aria-current="step"]');
    const scroller = el?.closest<HTMLElement>("[data-step-list]");
    if (!el || !scroller || scroller.scrollHeight <= scroller.clientHeight) return;
    const r = el.getBoundingClientRect();
    const box = scroller.getBoundingClientRect();
    if (r.top < box.top) scroller.scrollBy({ top: r.top - box.top - 6 });
    else if (r.bottom > box.bottom) scroller.scrollBy({ top: r.bottom - box.bottom + 6 });
  }, [i]);

  const btn = "tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-sm font-medium text-ink hover:border-muted disabled:opacity-40";
  const path = step.url.split("#")[0];
  let shown = path;
  try {
    shown = decodeURIComponent(path);
  } catch {
    // Keep the address as written.
  }

  return (
    <div
      // Side by side from 1180px: the step and its list on the left, the live page on the right. Narrower screens stack
      // the step, the live page and the list (the left column's box steps aside there, with display: contents).
      className="grid gap-4 [grid-template-areas:'step'_'live'_'list'] min-[1180px]:min-h-0 min-[1180px]:flex-1 min-[1180px]:grid-cols-[360px_minmax(0,1fr)] min-[1180px]:grid-rows-[minmax(0,1fr)] min-[1180px]:gap-x-6 min-[1180px]:[grid-template-areas:'side_live']"
    >
      {/* A short window scrolls this column; a tall one keeps the step still and scrolls only the list. */}
      <div className="contents min-[1180px]:flex min-[1180px]:min-h-0 min-[1180px]:flex-col min-[1180px]:gap-4 min-[1180px]:overflow-y-auto min-[1180px]:[grid-area:side]">
        <section aria-label="Tour step" className="space-y-3 rounded-card border border-line bg-bg-raised p-4 [grid-area:step] sm:p-5 min-[1180px]:shrink-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted" aria-live="polite">
            Step {i + 1} of {steps.length} · {step.chapter}
          </p>
          <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-medium leading-tight text-ink outline-none">
            {step.title}
          </h2>
          {step.body.map((p) => (
            <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-muted-strong">
              {p}
            </p>
          ))}
          {step.tryThis && (
            <p className="rounded-card border border-dashed border-line px-3 py-2 text-sm text-ink">
              <span className="font-medium">Try this: </span>
              {step.tryThis}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button type="button" className={btn} onClick={() => go(i - 1)} disabled={i === 0}>
              ← Back
            </button>
            <button type="button" className={btn} onClick={() => go(i + 1)} disabled={i === last}>
              Next →
            </button>
            <button type="button" aria-pressed={playing} onClick={() => setPlaying((p) => !p)} className={btn}>
              {playing ? "Pause" : "Autoplay"}
            </button>
          </div>
          {onFullTour && i === last && (
            <p className="border-t border-line pt-3 text-sm text-muted-strong">
              That&apos;s the short tour.{" "}
              <button type="button" onClick={onFullTour} className="tap-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                Full tour ({STEPS.length} steps) →
              </button>
            </p>
          )}
        </section>

        <nav aria-label="All steps" data-step-list className="[grid-area:list] min-[1180px]:-mr-2 min-[1180px]:min-h-[168px] min-[1180px]:flex-1 min-[1180px]:overflow-y-auto min-[1180px]:pr-2">
          <ol ref={list} className="space-y-0.5">
            {steps.map((s, n) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => go(n)}
                  aria-current={n === i ? "step" : undefined}
                  className={[
                    "tap-sm flex w-full items-baseline gap-2 rounded-md px-2 py-1.5 text-left text-xs",
                    n === i ? "bg-bg-raised font-medium text-ink ring-1 ring-line" : "text-muted-strong hover:bg-bg-raised hover:text-ink",
                  ].join(" ")}
                >
                  <span className="tnum w-5 shrink-0 text-muted">{n + 1}</span>
                  <span className="min-w-0 flex-1">{s.title}</span>
                  {s.chapter !== steps[n - 1]?.chapter && <span className="shrink-0 text-[10px] uppercase tracking-[0.08em] text-muted">{s.chapter}</span>}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <section
        aria-label="Live view"
        className="flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-bg-raised shadow-[0_8px_30px_rgba(0,0,0,0.06)] [grid-area:live] min-[1180px]:min-h-0"
      >
        <div className="flex items-center gap-3 border-b border-line px-3 py-2">
          <span aria-hidden className="hidden shrink-0 gap-1.5 sm:flex">
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
            <span className="h-2.5 w-2.5 rounded-full bg-line" />
          </span>
          <span className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-bg px-3 py-1 text-xs">
            <span className="shrink-0 font-medium text-muted-strong">Live site</span>
            <span aria-hidden className="text-line">|</span>
            <span className="truncate text-muted" title={shown}>
              {shown}
            </span>
          </span>
          <a
            href={step.url}
            target="_blank"
            rel="noopener"
            className="tap-sm inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-muted-strong underline decoration-line underline-offset-4 hover:text-ink"
          >
            Open in new tab <span aria-hidden>↗</span>
          </a>
        </div>
        <ScaledFrame src={step.url} title={`Live view: ${step.title}`} className="h-[70vh] min-h-[420px] min-[1180px]:h-auto min-[1180px]:min-h-0 min-[1180px]:flex-1" />
      </section>

    </div>
  );
}
