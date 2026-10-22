/** Shown while a tool's code is downloading, so a panel never opens blank. Pulses only when motion is welcome. */
export default function ToolLoading({ label = "Loading the tool…" }: { label?: string }) {
  const bar = "rounded-md bg-map-empty motion-safe:animate-pulse";
  return (
    <div role="status" aria-live="polite" data-tool-loading className="space-y-4">
      <span className="sr-only">{label}</span>
      <div aria-hidden className="space-y-4">
        <div className={`${bar} h-4 w-2/3`} />
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-card border border-line p-3">
              <div className={`${bar} h-5 w-3/4`} />
              <div className={`${bar} h-3 w-full`} />
            </div>
          ))}
        </div>
        <div className={`${bar} h-36 w-full`} />
        <div className={`${bar} h-3 w-5/6`} />
        <div className={`${bar} h-3 w-1/2`} />
      </div>
      <p aria-hidden className="text-xs text-muted">
        {label}
      </p>
    </div>
  );
}
