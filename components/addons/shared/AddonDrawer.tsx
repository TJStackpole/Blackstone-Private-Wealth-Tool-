"use client";

import Link from "next/link";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { FundCode } from "@/config/addons";
import { FUNDS, NEUTRAL_ACCENT } from "@/lib/addons/shared/funds";
import AddonBoundary from "./AddonBoundary";

const noop = () => () => {};

interface Props {
  open: boolean;
  onClose: () => void;
  addonId: string;
  title: string;
  /** "Full view" link to the add-on's toolkit page. */
  fullHref: string;
  fundId?: FundCode;
  children: ReactNode;
}

/**
 * Slide-over panel opened from a fund panel's chip: the add-on's compact view plus a "Full view" link.
 * Rendered into <body> so the map's bottom sheet can't clip it. Escape, the backdrop, and the close button all close it,
 * and focus goes back to the chip that opened it.
 */
export default function AddonDrawer({ open, onClose, addonId, title, fullHref, fundId, children }: Props) {
  const reduce = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // Kept in a ref so a new onClose each render doesn't re-run the open/close effect (which moves focus).
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const accent = fundId ? FUNDS[fundId] : NEUTRAL_ACCENT;

  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Everything behind the drawer is made inert, so Tab, clicks and screen readers stay inside it until it closes.
    const root = rootRef.current;
    const behind = root ? [...document.body.children].filter((el) => el !== root && !el.hasAttribute("inert")) : [];
    behind.forEach((el) => el.setAttribute("inert", ""));
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      behind.forEach((el) => el.removeAttribute("inert"));
      opener?.focus();
    };
  }, [open]);

  // False on the server and during hydration, true after: the portal never appears in server HTML.
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  if (!mounted) return null;
  const t = reduce ? { duration: 0 } : { duration: 0.22, ease: [0.2, 0, 0, 1] as const };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          key="drawer"
          ref={rootRef}
          className="atlas fixed inset-0 z-50"
          style={{ ["--layer-light" as string]: accent.color, ["--layer-dark" as string]: accent.colorDark }}
        >
          <motion.div className="absolute inset-0 bg-black/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={t} onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`drawer-${addonId}-h`}
            data-addon-drawer={addonId}
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-bg shadow-[-8px_0_30px_rgba(0,0,0,0.12)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={t}
          >
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 id={`drawer-${addonId}-h`} className="font-serif text-xl font-medium leading-tight text-ink">
                {title}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                className="tap inline-flex h-8 items-center rounded-full border border-line bg-bg-raised px-3 text-xs font-medium text-muted-strong hover:text-ink"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-5">
              <AddonBoundary addonId={addonId}>{children}</AddonBoundary>
            </div>
            <div className="border-t border-line px-5 py-3">
              <Link href={fullHref} className="tap inline-flex items-center text-sm font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
                Full view →
              </Link>
              <p className="mt-2 text-xs leading-relaxed text-muted">Illustrative only. Not investment, tax, or legal advice. The offering documents control.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
