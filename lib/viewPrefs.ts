/**
 * What a visitor last chose on the fund pages, kept in this browser: whether "See the details" was left open, and
 * whether the credit fund's Geography map was. A fund opened any way (its tab, a Start-screen card, Back, a new visit)
 * opens the same way; a link that asks for the details (?details=1) still opens them.
 */
const KEY = "pma-fund-view";

export interface ViewPrefs {
  details?: boolean;
  map?: boolean;
}

export function readViewPrefs(): ViewPrefs {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    if (!v || typeof v !== "object") return {};
    return {
      ...(typeof v.details === "boolean" ? { details: v.details } : {}),
      ...(typeof v.map === "boolean" ? { map: v.map } : {}),
    };
  } catch {
    // Private windows and blocked storage: the pages open the default way.
    return {};
  }
}

export function saveViewPref(patch: ViewPrefs) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...readViewPrefs(), ...patch }));
  } catch {
    // Storage blocked: the choice lasts for this page only.
  }
}
