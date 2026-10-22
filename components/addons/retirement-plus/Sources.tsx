import type { Source } from "@/lib/addons/retirement-plus/data";

const PAPER = "Blackstone, Expanding Retirement Investors' Access to Private Markets";

/** Short source links: "Blackstone paper, p. 6", "BREIT Form 10-Q", "Gibson Dunn". The full name shows on hover. */
export default function Sources({ sources, className = "" }: { sources: Source[]; className?: string }) {
  return (
    <span className={`text-xs text-muted ${className}`}>
      {sources.map((s, i) => (
        <span key={`${s.url}-${i}`}>
          {i > 0 && " · "}
          <a
            href={s.url}
            target="_blank"
            rel="noreferrer noopener"
            title={s.page ? `${s.name}, ${s.page}` : s.name}
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            {s.name.startsWith(PAPER) ? `Blackstone paper (2026)${s.page ? `, ${s.page}` : ""}` : s.name.split(",")[0]}
          </a>
        </span>
      ))}
    </span>
  );
}
