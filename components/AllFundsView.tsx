"use client";

import type { LayerDef, LayerId } from "@/lib/types";
import { toLayerId } from "@/lib/addons/shared/funds";
import CompareTable from "./CompareTable";

interface Props {
  layers: LayerDef[];
  onOpenLayer: (id: LayerId) => void;
}

/**
 * All funds, side by side: one comparison table. Each fund's name opens its page; the maps live on the fund pages,
 * so they aren't repeated here.
 */
export default function AllFundsView({ onOpenLayer }: Props) {
  return (
    <section id="panel-all" role="tabpanel" aria-label="All funds side by side" className="space-y-5">
      <CompareTable onOpen={(f) => onOpenLayer(toLayerId(f))} />
    </section>
  );
}
