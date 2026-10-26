"use client";

import { useMemo } from "react";
import type { FundCode } from "@/config/addons";
import { glossText, type Piece } from "@/lib/glossary";
import Term from "./Term";

/**
 * Text with its jargon linked to plain definitions, each term once. On a fund's own content pass `fund`, so only
 * general definitions and that fund's own are linked; elsewhere a fund's definition is shown as a labeled example.
 */
export default function Glossed({ text, fund }: { text: string; fund?: FundCode }) {
  const pieces = useMemo(() => glossText(text, fund), [text, fund]);
  return <Pieces pieces={pieces} fund={fund} />;
}

/** Several lines that read as one block: each term is linked once across all of them. */
export function GlossedLines({ lines, fund, className, first }: { lines: string[]; fund?: FundCode; className?: string; first?: string }) {
  const all = useMemo(() => {
    const seen = new Set<string>();
    return lines.map((l) => glossText(l, fund, seen));
  }, [lines, fund]);
  return (
    <ul className={className}>
      {all.map((pieces, j) => (
        <li key={lines[j]} className={j === 0 ? first : undefined}>
          <Pieces pieces={pieces} fund={fund} />
        </li>
      ))}
    </ul>
  );
}

function Pieces({ pieces, fund }: { pieces: Piece[]; fund?: FundCode }) {
  return (
    <>
      {pieces.map((p, i) =>
        typeof p === "string" ? (
          p
        ) : (
          <Term key={`${p.term.id}-${i}`} term={p.term} example={!fund}>
            {p.text}
          </Term>
        ),
      )}
    </>
  );
}
