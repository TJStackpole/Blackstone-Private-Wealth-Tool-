import type { AudienceId } from "@/lib/addons/retirement-plus/data";
import { ROOM } from "@/lib/addons/retirement-plus/data";

/** Worker | Employer. Changes wording and order on the 401(k) tab, never the numbers. Page memory only. */
export default function AudienceSwitch({ value, onChange }: { value: AudienceId; onChange: (a: AudienceId) => void }) {
  return (
    <div role="group" aria-label="View for" className="tap no-print inline-flex h-9 items-center rounded-full border border-line bg-bg-raised p-0.5">
      {(Object.keys(ROOM.audiences) as AudienceId[]).map((id) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={[
            "tap-sm h-8 whitespace-nowrap rounded-full px-3 text-xs font-medium transition-colors",
            value === id ? "bg-accent text-accent-contrast" : "text-muted-strong hover:text-ink",
          ].join(" ")}
        >
          {ROOM.audiences[id].label}
        </button>
      ))}
    </div>
  );
}
