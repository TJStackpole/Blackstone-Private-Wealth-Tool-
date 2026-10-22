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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-bg text-ink">{children}</body>
    </html>
  );
}
