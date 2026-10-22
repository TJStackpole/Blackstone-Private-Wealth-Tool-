"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** Printed only: a plain investment-committee memo heading. The date is the day it's printed. */
export default function MemoHeader() {
  const today = useSyncExternalStore(
    noop,
    () => new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    () => "",
  );
  return (
    <div className="hidden border-b pb-2 text-xs print:block">
      <p className="font-serif text-lg">Memorandum</p>
      <dl className="mt-1 grid grid-cols-[64px_1fr] gap-x-2 gap-y-0.5">
        <dt className="font-medium">To</dt>
        <dd>Investment Committee</dd>
        <dt className="font-medium">From</dt>
        <dd>&nbsp;</dd>
        <dt className="font-medium">Date</dt>
        <dd>{today}</dd>
        <dt className="font-medium">Re</dt>
        <dd>Evergreen vs. drawdown private markets allocation: structure and cash drag (illustrative)</dd>
      </dl>
    </div>
  );
}
