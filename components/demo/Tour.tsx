"use client";

import Link from "next/link";
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
    <div className="space-y-4">
      <div role="group" aria-label="Tour length" className="tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised p-0.5">
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

/** The guided tour: explanation on the left, the live page on the right, with Back / Next, a step list and autoplay. */
function Tour({ steps, onFullTour }: { steps: TourStep[]; onFullTour?: () => void }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const step = steps[i];
  const last = steps.length - 1;

  function go(n: number, focus = true) {
    const next = Math.max(0, Math.min(last, n));
    setI(next);
    if (focus) requestAnimationFrame(() => headingRef.current?.focus());
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

  const btn = "tap inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-sm font-medium text-ink hover:border-muted disabled:opacity-40";

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <section aria-label="Tour step" className="space-y-5 lg:sticky lg:top-6 lg:self-start">
        <div className="space-y-3 rounded-card border border-line bg-bg-raised p-4 sm:p-5">
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
          <Link href={step.url} className="tap inline-flex items-center text-xs text-muted-strong underline decoration-line underline-offset-4 hover:text-ink">
            Open this view on its own →
          </Link>
          {onFullTour && i === last && (
            <p className="border-t border-line pt-3 text-sm text-muted-strong">
              That&apos;s the short tour.{" "}
              <button type="button" onClick={onFullTour} className="tap-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                Full tour ({STEPS.length} steps) →
              </button>
            </p>
          )}
        </div>

        <nav aria-label="All steps">
          <ol className="space-y-0.5">
            {steps.map((s, n) => (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => go(n)}
                  aria-current={n === i ? "step" : undefined}
                  className={[
                    "tap-sm flex w-full items-baseline gap-2 rounded-md px-2 py-1 text-left text-xs",
                    n === i ? "bg-bg-raised font-medium text-ink" : "text-muted-strong hover:text-ink",
                  ].join(" ")}
                >
                  <span className="tnum w-5 shrink-0 text-muted">{n + 1}</span>
                  {s.title}
                </button>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      <section aria-label="Live view" className="min-w-0">
        <div className="overflow-hidden rounded-card border border-line bg-bg shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 border-b border-line bg-bg-raised px-3 py-2">
            <span aria-hidden className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
              <span className="h-2 w-2 rounded-full bg-line" />
            </span>
            <span className="truncate text-xs text-muted">{step.url}</span>
          </div>
          <ScaledFrame src={step.url} title={`Live view: ${step.title}`} />
        </div>
      </section>
    </div>
  );
}
