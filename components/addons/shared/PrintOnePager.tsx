"use client";

import type { ReactNode } from "react";

/**
 * Print-friendly wrapper with a "Print / Save as PDF" button. Uses the browser's own print dialog,
 * so no PDF library is needed. While printing, only this block is shown.
 */
export default function PrintOnePager({ title, children, screen = true }: { title: string; children: ReactNode; screen?: boolean }) {
  return (
    <section aria-label={`${title} (printable)`} className="space-y-3">
      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="tap inline-flex h-8 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink"
        >
          Print / Save as PDF
        </button>
      </div>
      {/* screen={false}: a print-only summary that stays hidden on the page itself. */}
      <div className={screen ? "print-onepager" : "print-onepager hidden print:block"}>{children}</div>
      <style>{`
        @media print {
          /* Remove everything except the one-pager and the elements that contain it, so nothing else takes up paper. */
          body *:not(:has(.print-onepager)):not(.print-onepager):not(.print-onepager *) { display: none !important; }
          html, body, body *:has(.print-onepager) { background: #fff !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: 0 !important; }
          .print-onepager { display: block !important; color: #14161a; }
          .print-onepager * { color: #14161a !important; border-color: #c9ccd1 !important; background: transparent !important; }
          .no-print { display: none !important; }
          @page { size: letter; margin: 0.5in; }
        }
      `}</style>
    </section>
  );
}
