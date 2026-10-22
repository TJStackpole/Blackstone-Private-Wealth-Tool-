"use client";

import type { LayerId } from "@/lib/types";
import GapHero from "./GapHero";
import GlideMix from "./GlideMix";
import WhyMissing from "./WhyMissing";

/** The upgraded 401(k) tab (BUILD_PLAN_401K.md). Renders inside the Retirement tab's slot when the add-on is on. */
export default function RetirementPlus({ onOpenLayer }: { onOpenLayer: (id: LayerId) => void }) {
  return (
    <div className="rp space-y-14">
      <GapHero lede="Pension funds have long held private markets. Most 401(k)s, where workers now do most of their saving, hold almost none." />
      <WhyMissing />
      <GlideMix onOpenLayer={onOpenLayer} />
    </div>
  );
}
