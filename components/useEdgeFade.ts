"use client";

import { useEffect, type RefObject } from "react";

/**
 * Marks a sideways-scrolling row with data-fade-left / data-fade-right while there's more to see in that direction,
 * so CSS (.edge-fade) can fade that edge. Nothing happens when the row fits.
 */
export function useEdgeFade(ref: RefObject<HTMLElement | null>, contentKey?: unknown) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      el.dataset.fadeRight = String(max > 1 && el.scrollLeft < max - 1);
      el.dataset.fadeLeft = String(max > 1 && el.scrollLeft > 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [ref, contentKey]);
}
