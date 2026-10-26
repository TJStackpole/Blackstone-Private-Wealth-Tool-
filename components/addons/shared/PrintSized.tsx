"use client";

import { cloneElement, useEffect, useState, type ReactElement } from "react";
import { flushSync } from "react-dom";
import { ResponsiveContainer } from "recharts";

/**
 * True while the page is being printed. "beforeprint" re-renders synchronously, before the browser lays the page
 * out for paper.
 */
export function usePrinting(): boolean {
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const on = () => flushSync(() => setPrinting(true));
    const off = () => setPrinting(false);
    const media = typeof window.matchMedia === "function" ? window.matchMedia("print") : null;
    const change = (e: MediaQueryListEvent) => (e.matches ? on() : off());
    window.addEventListener("beforeprint", on);
    window.addEventListener("afterprint", off);
    media?.addEventListener("change", change);
    return () => {
      window.removeEventListener("beforeprint", on);
      window.removeEventListener("afterprint", off);
      media?.removeEventListener("change", change);
    };
  }, []);
  return printing;
}

/** The width a chart gets on a Letter page with half-inch margins (7.5in at 96 per inch, less a little room). */
const PRINT_WIDTH = 700;

/**
 * A chart that fills its box on screen and draws at a fixed size on paper. A chart sized to its box doesn't
 * re-measure when the page is laid out for printing, so it would spill over the text below it.
 */
export function PrintSized({ height, off = false, children }: { height: number; off?: boolean; children: ReactElement<{ width?: number; height?: number }> }) {
  const printing = usePrinting();
  if (printing && !off) return cloneElement(children, { width: PRINT_WIDTH, height });
  return (
    <ResponsiveContainer width="100%" height="100%">
      {children}
    </ResponsiveContainer>
  );
}
