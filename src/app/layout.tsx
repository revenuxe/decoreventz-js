import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Providers } from "./providers";
import { JsonLd } from "@/components/JsonLd";
import { organizationJsonLd } from "@/lib/jsonld";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { unsplash } from "@/data/images";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const SITE_TITLE = "Balloon & Event Decoration Services | Birthday, Wedding & More";
const SITE_DESCRIPTION =
  "Professional balloon and event decoration for birthdays, weddings, baby showers, corporate events and more — book online in minutes, get a same-week setup at your venue.";
// A real, already-live photo (also the homepage hero image) — replaces the
// old Lovable-hosted preview screenshot, which 404s.
const OG_IMAGE = unsplash("balloonArch", 1200, 630);

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: [
    "balloon decoration",
    "birthday decoration",
    "event decorators",
    "wedding decoration",
    "baby shower decoration",
    "corporate event decoration India",
  ],
  authors: [{ name: SITE_NAME }],
  icons: { icon: "/favicon.ico", shortcut: "/favicon.ico" },
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_IN",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4c075c",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <JsonLd data={organizationJsonLd()} />
        <Providers>{children}</Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
