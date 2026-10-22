"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab's title for a view that changes without a page load (the map's fund tabs). Next.js writes the
 * page's own title from its metadata after the page loads, so this puts the view's title back whenever that happens,
 * but only while the address is still this page's: on the way to another page, that page's title wins.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const page = window.location.pathname;
    const apply = () => {
      if (window.location.pathname === page && document.title !== title) document.title = title;
    };
    apply();
    const watch = new MutationObserver(apply);
    watch.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => watch.disconnect();
  }, [title]);
}
