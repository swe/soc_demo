import "./globals.css";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { site } from "@/data/site";
import { cn } from "@/lib/utils";

import { Providers } from "./providers";

const geistSansMain = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Heimdall — Security operations by Svalbard Security";

export const metadata: Metadata = {
  metadataBase: new URL("https://svalbard.ca"),
  title: {
    default: title,
    template: `%s - ${site.title}`,
  },
  description: site.description,
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    shortcut: "/favicon/favicon.ico",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    title,
    description: site.description,
    siteName: site.title,
    images: [
      {
        url: "/images/og-image.png",
        width: 1797,
        height: 1029,
        alt: title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    images: ["/images/og-image.png"],
    creator: "@SvalbardSec",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans", geistSansMain.variable)}
    >
      <body
        className={cn(
          "group/body antialiased",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
