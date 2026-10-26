import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { pageMeta, SITE_URL } from "@/lib/meta";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  ...pageMeta({
    description:
      "An independent, interactive map of where four retail private-markets funds invest, built from their SEC filings. Not affiliated with Blackstone. Not investment advice.",
    path: "/",
  }),
  metadataBase: new URL(SITE_URL),
  // Every page's tab reads "<page> · Private Markets Atlas"; the map sets its own as the view changes.
  title: { default: "Private Markets Atlas", template: "%s · Private Markets Atlas" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F5F0" },
    { media: "(prefers-color-scheme: dark)", color: "#0F1115" },
  ],
};

/**
 * Runs before paint so the saved theme never flashes. It also follows a theme change made in another tab or frame
 * (the tour's live view is a frame), through the storage event.
 */
const themeScript = `
(function(){try{var t=localStorage.getItem('pma-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');
window.addEventListener('storage',function(e){if(e.key==='pma-theme'&&e.newValue)document.documentElement.classList.toggle('dark',e.newValue==='dark');});}catch(e){}})();
`;

/**
 * The map page is exported as its Start screen; a link to a view (/?view=bcred) switches once the page's script runs.
 * Until then the page is hidden, so a BCRED link never flashes the Start screen. AtlasFromUrl clears the flag after
 * switching; the timer is a backstop.
 */
const deepLinkScript = `
(function(){try{var v=new URLSearchParams(location.search).get('view');if(location.pathname==='/'&&v){var h=document.documentElement;h.setAttribute('data-deeplink','');setTimeout(function(){h.removeAttribute('data-deeplink');},4000);}}catch(e){}})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: deepLinkScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
