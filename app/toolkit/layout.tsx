import type { ReactNode } from "react";
import { AudienceProvider } from "@/components/addons/shared/Audience";

/** Toolkit pages share one Advisor / Family Office setting while you move between them. The map is outside this layout. */
export default function ToolkitLayout({ children }: { children: ReactNode }) {
  return <AudienceProvider>{children}</AudienceProvider>;
}
