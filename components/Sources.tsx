"use client";

import { useId, useState, type ReactNode } from "react";

/**
 * Fine print on demand: a small "Sources" link that shows the source links behind it. The as-of date stays beside it
 * in plain view, and on paper the sources always print.
 */
export default function Sources({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="no-print inline underline decoration-line underline-offset-2 hover:text-ink"
      >
        {open ? "Hide sources" : "Sources"}
      </button>
      <span id={id} className={open ? "mt-1 block" : "hidden print:block"}>
        {children}
      </span>
    </>
  );
}
