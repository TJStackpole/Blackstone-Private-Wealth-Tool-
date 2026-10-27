"use client";

import { useEffect, useRef, useState } from "react";

/** The width the live view lays the site out at: wide enough for its desktop layout (side panel beside the map). */
const DESKTOP = 1100;
/** Narrower than this (a phone), the live view shows the site as that phone would instead of shrinking it. */
const MIN_SCALED = 640;

/**
 * The guided tour's live view: the real page in a frame. From tablet width up it lays the page out at desktop width
 * and scales it to fit, so the map always has its desktop layout; on phones it shows the page at the phone's width.
 * While a page loads (and scrolls to the step's spot), a quiet placeholder covers it instead of a blank or jumping page.
 */
export default function ScaledFrame({ src, title, className = "" }: { src: string; title: string; className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const [ready, setReady] = useState<string | null>(null);
  // The step whose page has arrived: a later load in the same frame is the visitor clicking around, so it stays put.
  const arrived = useRef<string | null>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = size && size.w >= MIN_SCALED && size.w < DESKTOP ? size.w / DESKTOP : 1;
  // The frame loads the page without its #anchor and scrolls only itself to it: the browser's own jump to an anchor
  // inside a same-site frame would scroll the tour page too. A page keeps settling after it loads (it switches to the
  // step's view, draws its charts), so this waits until the spot has stopped moving, then scrolls and uncovers it.
  const [path, anchor] = src.split("#");
  function arrive(frame: HTMLIFrameElement) {
    if (arrived.current === src) return;
    arrived.current = src;
    const w = frame.contentWindow;
    const done = () => setReady(src);
    if (!w) return done();
    const started = Date.now();
    let last = NaN;
    let still = 0;
    const tick = () => {
      if (arrived.current !== src) return; // the tour has moved on
      let d: Document;
      try {
        d = w.document;
      } catch {
        return done();
      }
      const el = anchor ? d.getElementById(anchor) : null;
      const switched = !d.documentElement.hasAttribute("data-deeplink") && (!anchor || !!el);
      const at = el ? el.getBoundingClientRect().top + w.scrollY : d.documentElement.scrollHeight;
      still = switched && at === last ? still + 1 : 0;
      last = at;
      if (still >= 3 || Date.now() - started > 4000) {
        if (el) w.scrollTo({ top: el.getBoundingClientRect().top + w.scrollY - 12 });
        return done();
      }
      setTimeout(tick, 100);
    };
    tick();
  }
  const loading = ready !== src;
  return (
    <div ref={box} className={`relative w-full overflow-hidden bg-bg ${className}`}>
      {/* Drawn once the box is measured, so the page is laid out at its final width from the start. */}
      {size && (
        <iframe
          key={src}
          src={path}
          onLoad={(e) => arrive(e.currentTarget)}
          title={title}
          className="absolute left-0 top-0 block border-0 bg-bg"
          style={
            scale < 1
              ? { width: DESKTOP, height: size.h / scale, transform: `scale(${scale})`, transformOrigin: "0 0" }
              : { width: "100%", height: "100%" }
          }
        />
      )}
      <div
        aria-hidden
        className={[
          "pointer-events-none absolute inset-0 flex items-center justify-center bg-bg transition-opacity duration-200 motion-reduce:transition-none",
          loading ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        <span className="flex items-center gap-2 text-xs text-muted">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent motion-reduce:animate-none" />
          Loading the live page…
        </span>
      </div>
    </div>
  );
}
