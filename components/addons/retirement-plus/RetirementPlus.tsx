"use client";

import { useState, type ReactNode } from "react";
import type { LayerId } from "@/lib/types";
import { RETIREMENT } from "@/data/layers";
import { REGULATORY, ROOM, type AudienceId } from "@/lib/addons/retirement-plus/data";
import { PAPER_DEFAULTS } from "@/lib/addons/retirement-plus/defaults";
import AudienceSwitch from "./AudienceSwitch";
import Concerns from "./Concerns";
import GapHero from "./GapHero";
import GlideMix from "./GlideMix";
import HowItGetsIn from "./HowItGetsIn";
import LiquidityDrift from "./LiquidityDrift";
import OutcomeLab from "./OutcomeLab";
import RoomPrint from "./RoomPrint";
import Timeline from "./Timeline";
import WhyMissing from "./WhyMissing";

type SectionId = "why" | "mix" | "lab" | "how" | "liquidity" | "concerns" | "timeline";

/** Section order per audience. The audience changes wording and order, never the numbers. */
export const SECTION_ORDER: Record<AudienceId, SectionId[]> = {
  worker: ["why", "mix", "lab", "how", "liquidity", "concerns", "timeline"],
  employer: ["why", "concerns", "liquidity", "how", "timeline", "lab", "mix"],
};

/** The upgraded 401(k) tab (BUILD_PLAN_401K.md). Renders inside the Retirement tab's slot when the add-on is on. */
export default function RetirementPlus({ onOpenLayer }: { onOpenLayer: (id: LayerId) => void }) {
  // Both live here so every section and the printout share them. Page memory only; nothing is stored.
  const [lab, setLab] = useState(PAPER_DEFAULTS);
  const [audience, setAudience] = useState<AudienceId>("worker");
  const a = ROOM.audiences[audience];

  const sections: Record<SectionId, ReactNode> = {
    why: <WhyMissing />,
    mix: <GlideMix onOpenLayer={onOpenLayer} />,
    lab: <OutcomeLab params={lab} onChange={setLab} />,
    how: <HowItGetsIn audience={audience} />,
    liquidity: <LiquidityDrift privatePct={lab.privatePct} />,
    concerns: <Concerns audience={audience} />,
    timeline: <Timeline entries={[...RETIREMENT.milestones, ...REGULATORY.entries]} checked={REGULATORY.asOf} />,
  };

  return (
    <div className="rp space-y-14">
      {/* Not no-print: the print-only one-pager lives inside this row. */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <AudienceSwitch value={audience} onChange={setAudience} />
          <p className="text-sm text-muted-strong" aria-live="polite">
            {a.title}
          </p>
        </div>
        <RoomPrint audience={audience} lab={lab} />
      </div>
      <GapHero lede={a.lede} />
      {SECTION_ORDER[audience].map((id) => (
        <div key={id} data-section={id}>
          {sections[id]}
        </div>
      ))}
    </div>
  );
}
