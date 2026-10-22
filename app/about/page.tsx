import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";
import Link from "next/link";
import SiteMark, { SITE_NAME } from "@/components/SiteMark";
import ThemeToggle from "@/components/ThemeToggle";

export const metadata: Metadata = pageMeta({
  title: "About",
  description: "Built by TJ Stackpole to help advisors explain perpetual private-markets funds using only public SEC filings. Independent; not affiliated with Blackstone.",
  path: "/about",
});

const LINKEDIN = "linkedin.com/in/terence-stackpole";
const EMAIL = "ts1582@georgetown.edu";

export default function AboutPage() {
  return (
    <main className="atlas mx-auto w-full max-w-[760px] flex-1 px-4 pb-16 pt-5 sm:px-6 lg:pt-7">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-3">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-strong">
          <SiteMark />
        </nav>
        <ThemeToggle />
      </header>

      <h1 className="font-serif text-[36px] font-medium leading-[1.05] tracking-[-0.02em] text-ink sm:text-[44px]">About</h1>

      <section className="mt-8 space-y-4 text-base leading-relaxed text-muted-strong">
        <p className="font-serif text-[22px] leading-snug text-ink">Built by TJ Stackpole.</p>
        <p>
          Former U.S. Marine Corps infantry officer and company commander. MBA candidate at Georgetown University&apos;s McDonough School of Business,
          Class of 2027.
        </p>
        <p>
          {SITE_NAME} was built to help financial advisors explain perpetual private-markets funds using only public SEC filings: where the money is,
          what changed this quarter, how getting money out works, and what the funds&apos; own goals look like next to their results.
        </p>
      </section>

      <section aria-labelledby="contact-h" className="mt-10 rounded-card border border-line bg-bg-raised p-5 sm:p-6">
        <h2 id="contact-h" className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          Contact
        </h2>
        <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
          <dt className="text-muted">LinkedIn</dt>
          <dd>
            <a href={`https://www.${LINKEDIN}`} target="_blank" rel="noreferrer noopener" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
              {LINKEDIN}
            </a>
          </dd>
          <dt className="text-muted">Email</dt>
          <dd>
            <a href={`mailto:${EMAIL}`} className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
              {EMAIL}
            </a>
          </dd>
        </dl>
      </section>

      <section aria-labelledby="how-h" className="mt-10 space-y-3 text-sm leading-relaxed text-muted-strong">
        <h2 id="how-h" className="font-serif text-xl font-medium text-ink">
          How it&apos;s built
        </h2>
        <p>
          Every fund figure comes from the funds&apos; own 10-Q and 10-K filings on SEC EDGAR. The numbers are parsed from the filings and checked against
          the totals the filings print, and each one links back to its source with an as-of date. Where a filing doesn&apos;t give a figure, the site
          says &ldquo;Not in filing&rdquo; instead of estimating it. Calculators are labeled Illustrative.
        </p>
        <p>
          <Link href="/demo" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
            Take the tour
          </Link>{" "}
          or open the{" "}
          <Link href="/toolkit" className="text-ink underline decoration-line underline-offset-4 hover:decoration-accent">
            Advisor Toolkit
          </Link>
          .
        </p>
      </section>

      <footer className="mt-12 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        Independent prototype built from public filings. Not affiliated with or endorsed by Blackstone. Not investment advice.
      </footer>
    </main>
  );
}
