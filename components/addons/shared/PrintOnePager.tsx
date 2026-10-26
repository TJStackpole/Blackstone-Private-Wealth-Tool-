"use client";

import type { ReactNode } from "react";

/**
 * Print-friendly wrapper with a "Print / Save as PDF" button. Uses the browser's own print dialog,
 * so no PDF library is needed. While printing, only this block is shown.
 */
export function PrintButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={`tap no-print inline-flex h-8 items-center whitespace-nowrap rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink ${className}`}
    >
      Print / Save as PDF
    </button>
  );
}

/** `button={false}` when the page puts its own PrintButton elsewhere (the fund pages put one by the fund's title). */
export default function PrintOnePager({ title, children, screen = true, button = true }: { title: string; children: ReactNode; screen?: boolean; button?: boolean }) {
  return (
    <section aria-label={`${title} (printable)`} className={button ? "space-y-3" : screen ? undefined : "hidden print:block"}>
      {button && (
        <div className="no-print flex justify-end">
          <PrintButton />
        </div>
      )}
      {/* screen={false}: a print-only summary that stays hidden on the page itself. */}
      <div className={screen ? "print-onepager" : "print-onepager hidden print:block"}>{children}</div>
      <style>{`
        @media print {
          /* Remove everything except the one-pager and the elements that contain it, so nothing else takes up paper. */
          body *:not(:has(.print-onepager)):not(.print-onepager):not(.print-onepager *) { display: none !important; }
          /* Dark mode sets a dark page canvas; paper is white, margins included. */
          :root { color-scheme: light !important; }
          html, body, body *:has(.print-onepager) { background: #fff !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: 0 !important; }
          /* Paper is light even when the screen is dark: charts that read the color tokens get the light ones. */
          .print-onepager { display: block !important; color: #14161a; --text: #14161a; --muted: #5f656e; --muted-strong: #4a4f57; --border: #c9ccd1; --bg: #fff; --bg-raised: #fff; --map-empty: #e4e0d6; --accent: #1f3a5f; }
          .print-onepager * { color: #14161a !important; border-color: #c9ccd1 !important; background: transparent !important; }
          /* Bars drawn as filled boxes keep their fill on paper. */
          .print-onepager .print-fill { background: #5b6170 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .print-onepager .print-fill-light { background: #c9ccd1 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          @page { size: letter; margin: 0.5in; }
        }
      `}</style>
    </section>
  );
}
