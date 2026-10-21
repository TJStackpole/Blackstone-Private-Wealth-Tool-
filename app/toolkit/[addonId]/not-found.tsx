import Link from "next/link";

/** Shown at the address of an add-on that's switched off or not built yet. */
export default function AddonNotAvailable() {
  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-16 sm:px-6">
      <h1 className="font-serif text-[28px] font-medium leading-tight text-ink">This tool isn&apos;t available</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-strong">It may not be built yet, or it&apos;s switched off for now. The map and the other tools still work.</p>
      <div className="mt-6 flex gap-3 text-sm">
        <Link href="/toolkit" className="inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-muted-strong hover:text-ink">
          Advisor Toolkit
        </Link>
        <Link href="/" className="inline-flex h-9 items-center rounded-full border border-line bg-bg-raised px-4 text-muted-strong hover:text-ink">
          Back to the map
        </Link>
      </div>
    </div>
  );
}
