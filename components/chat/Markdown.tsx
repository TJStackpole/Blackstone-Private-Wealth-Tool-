import type { ReactNode } from "react";
import { isAllowedUrl } from "@/lib/chat/limits";

/**
 * Renders an answer's light markdown (paragraphs, short headings, bullet and numbered lists, bold, italics, code and
 * links) as React elements, never as HTML. A link becomes clickable only if it points at an approved site; otherwise
 * its words stay and its address is dropped.
 */
export default function Markdown({ text }: { text: string }) {
  const blocks = text.replace(/\r\n?/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d+[.)]/.test(lines[0]);
          const items = lines.map((l) => l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
          const List = ordered ? "ol" : "ul";
          return (
            <List key={i} className={["space-y-1 pl-5", ordered ? "list-decimal" : "list-disc"].join(" ")}>
              {items.map((it, j) => (
                <li key={j}>{inline(it)}</li>
              ))}
            </List>
          );
        }
        const heading = lines.length === 1 && lines[0].match(/^#{1,4}\s+(.+)$/);
        if (heading) return <p key={i} className="font-semibold text-ink">{inline(heading[1])}</p>;
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {inline(l.replace(/^#{1,4}\s+/, ""))}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

const TOKEN = /\[([^\]\n]+)\]\((\S+?)\)|(https:\/\/[^\s)\]>"']+)|\*\*([^*\n]+)\*\*|(?<![\w*])\*([^*\n]+)\*(?![\w*])|(?<![\w_])_([^_\n]+)_(?![\w_])|`([^`\n]+)`/g;

function link(url: string, label: ReactNode, key: number): ReactNode {
  if (!isAllowedUrl(url)) return <span key={key}>{label}</span>;
  return (
    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-ink underline decoration-line underline-offset-2 hover:decoration-ink">
      {label}
    </a>
  );
}

/** Bold, italics, code and links inside one line. */
function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of s.matchAll(TOKEN)) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const [, label, url, bare, bold, em1, em2, code] = m;
    if (label !== undefined) out.push(link(url, label, k++));
    else if (bare !== undefined) {
      const clean = bare.replace(/[.,;:]+$/, "");
      out.push(link(clean, clean.replace(/^https:\/\/(www\.)?/, ""), k++));
      if (clean.length < bare.length) out.push(bare.slice(clean.length));
    } else if (bold !== undefined) out.push(<strong key={k++} className="font-semibold text-ink">{bold}</strong>);
    else if (em1 !== undefined || em2 !== undefined) out.push(<em key={k++}>{em1 ?? em2}</em>);
    else if (code !== undefined) out.push(<code key={k++} className="rounded bg-bg-raised px-1 text-[0.92em]">{code}</code>);
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
