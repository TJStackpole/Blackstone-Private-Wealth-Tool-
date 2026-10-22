import AddonShell from "@/components/addons/shared/AddonShell";
import ClientScriptCard from "@/components/addons/shared/ClientScriptCard";
import { CONTENT } from "@/lib/addons/smoothing/data";
import Explainer from "./Explainer";

/** Add-on 2: why a private fund's value moves so little, and what that does and doesn't mean. */
export default function SmoothingPage() {
  return (
    <AddonShell
      addonId="smoothing"
      title="Why So Smooth?"
      subtitle="A private fund's value comes from appraisals and models, not daily trading, so it moves less than a stock or a listed REIT. Here's why, what that does and doesn't mean, and how to talk about it before a client asks."
    >
      <div className="space-y-12">
        <Explainer />
        <ClientScriptCard title="The 30-second answer to “Why does this look so stable?”" points={CONTENT.script} />
      </div>
    </AddonShell>
  );
}
