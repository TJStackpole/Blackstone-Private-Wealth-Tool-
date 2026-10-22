"use client";

import type { QuickProps } from "../quick";
import { CONTENT } from "@/lib/addons/smoothing/data";
import { FUNDS } from "@/lib/addons/shared/funds";
import SmoothChart from "./SmoothChart";

/** Drawer view: the 30-second answer and a mini chart. */
export default function SmoothingQuick({ fund }: QuickProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">The 30-second answer: why does {FUNDS[fund].label} look so stable?</p>
        <ul className="list-disc space-y-1.5 pl-4 text-sm leading-relaxed text-muted-strong">
          {CONTENT.script.map((s) => (
            <li key={s.slice(0, 40)}>{s}</li>
          ))}
        </ul>
      </div>
      <SmoothChart compact />
    </div>
  );
}
