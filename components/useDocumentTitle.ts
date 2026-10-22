"use client";

import { useEffect } from "react";

/**
 * Sets the browser tab's title for a view that changes without a page load (the map's fund tabs). Next.js writes the
 * page's own title from its metadata after the page loads, so this puts the view's title back whenever that happens.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    const watch = new MutationObserver(apply);
    watch.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => watch.disconnect();
  }, [title]);
}
