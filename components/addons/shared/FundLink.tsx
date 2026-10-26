"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useFundParam } from "./useFundParam";

/** A link to another tool that keeps the fund the page was opened for (?fund=BCRED). */
export default function FundLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const fund = useFundParam();
  return (
    <Link href={fund ? `${href}?fund=${fund}` : href} className={className}>
      {children}
    </Link>
  );
}
