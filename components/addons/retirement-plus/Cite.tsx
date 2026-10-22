import type { PaperSource } from "@/lib/addons/retirement-plus/data";

/** A visible page citation for a figure from the paper. */
export default function Cite({ source, className = "" }: { source: PaperSource; className?: string }) {
  return (
    <a
      href={source.url}
      target="_blank"
      rel="noreferrer noopener"
      title={`${source.name}, ${source.page}`}
      className={`text-xs text-muted underline decoration-line underline-offset-2 hover:text-ink ${className}`}
    >
      Blackstone paper, {source.page}
    </a>
  );
}
