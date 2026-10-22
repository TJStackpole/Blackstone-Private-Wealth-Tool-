import Link from "next/link";
import SiteMark from "@/components/SiteMark";

/** /toolkit/retirement-plus: the 401(k) tool lives on the map's Retirement tab, so this address points there. */
export default function RetirementPointer() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6">
      <nav aria-label="Breadcrumb" className="mb-8 text-xs text-muted-strong">
        <SiteMark />
      </nav>
      <h1 className="font-serif text-[28px] font-medium leading-tight tracking-[-0.01em] text-ink sm:text-[32px]">Private markets in a 401(k)</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-strong">This lives on the map&apos;s Retirement tab: the gap, the Outcome Lab and the questions clients ask.</p>
      <Link
        href="/?view=retirement"
        className="tap mt-6 inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-sm font-medium text-ink hover:border-muted"
      >
        Open the Retirement tab →
      </Link>
    </div>
  );
}
