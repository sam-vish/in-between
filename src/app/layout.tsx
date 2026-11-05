import type { Metadata, Viewport } from "next";
import { Anton, Permanent_Marker, Space_Grotesk, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/site";
import "./globals.css";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--ff-anton" });
const vt323 = VT323({ weight: "400", subsets: ["latin"], display: "swap", variable: "--ff-vt" });
const grotesk = Space_Grotesk({ subsets: ["latin"], display: "swap", variable: "--ff-body" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], display: "swap", variable: "--ff-marker" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  openGraph: { title: site.title, description: site.description, type: "website", siteName: site.name },
  twitter: { card: "summary_large_image", title: site.title, description: site.description },
};

export const viewport: Viewport = { themeColor: "#0B0B0C", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${vt323.variable} ${grotesk.variable} ${marker.variable}`}>
      <body>
        {children}
        <div aria-hidden className="tv-overlay" />
        <Analytics />
      </body>
    </html>
  );
}
