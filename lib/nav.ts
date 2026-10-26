/** Fired after navigate() changes the address, so the map page (AtlasFromUrl) reopens at the new view. */
export const NAV_EVENT = "pma-nav";

/**
 * Opens another view of the map page ("/", "/?view=bcred&details=1") as a new history entry, without reloading,
 * so Back returns to where the advisor was. Only meaningful on the map page; elsewhere links load the page.
 */
export function navigate(href: string) {
  window.history.pushState(null, "", href);
  window.dispatchEvent(new Event(NAV_EVENT));
  window.scrollTo({ top: 0 });
}
