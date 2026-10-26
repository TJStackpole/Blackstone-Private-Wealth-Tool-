"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { navigate } from "@/lib/nav";

/**
 * A link that, on the map page, switches to another of its views ("/?view=bcred") in place, with Back returning;
 * anything else (a tool's page, or a new tab) is an ordinary link.
 */
export default function ViewLink({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  if (!(href === "/" || href.startsWith("/?"))) return <Link href={href} onClick={onClick} {...rest} />;
  return (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (window.location.pathname !== "/") return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}
