import Link from "next/link";

/**
 * The header's lead button: a short guided tour, filled in the page's accent so a first-time visitor can find it.
 * Hidden inside the tour's own live view, where it would only open the tour again.
 */
export default function TourButton() {
  return (
    <Link
      href="/demo"
      data-hide-framed
      title="A six-step walkthrough of the maps and the Advisor Toolkit"
      className="tap inline-flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-xs font-semibold text-accent-contrast shadow-sm ring-4 ring-accent/15 transition-opacity hover:opacity-90"
    >
      <svg aria-hidden width="12" height="12" viewBox="0 0 12 12">
        <path d="M3 1.8v8.4L10 6z" fill="currentColor" />
      </svg>
      Take the tour
    </Link>
  );
}
