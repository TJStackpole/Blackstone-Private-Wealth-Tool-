"use client";

import type { ReactNode } from "react";

/**
 * Print-friendly wrapper with a "Print / Save as PDF" button. Uses the browser's own print dialog,
 * so no PDF library is needed. While printing, only this block is shown.
 */
export default function PrintOnePager({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section aria-label={`${title} (printable)`} className="space-y-3">
      <div className="no-print flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-8 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:border-muted hover:text-ink"
        >
          Print / Save as PDF
        </button>
      </div>
      <div className="print-onepager">{children}</div>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          .print-onepager, .print-onepager * { visibility: visible !important; }
          .print-onepager { position: absolute; inset: 0 auto auto 0; width: 100%; padding: 0.5in; background: #fff; color: #14161a; }
          .no-print { display: none !important; }
          @page { size: letter; margin: 0.4in; }
        }
      `}</style>
    </section>
  );
}
