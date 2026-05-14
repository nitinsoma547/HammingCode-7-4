import type { Metadata } from "next";
import { serif, sans } from "@/lib/fonts";
import { brand } from "@/content/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: brand.name,
    template: `%s · ${brand.name}`,
  },
  description: brand.tagline,
  openGraph: {
    title: brand.name,
    description: brand.tagline,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
