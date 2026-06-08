import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SacredSamskara - Monthly Pooja Kit Delivered to Your Doorstep",
  description:
    "All your essential pooja items — sourced with devotion, packed conveniently, delivered every month. Premium Deepa Oil, Agarbatti, Camphor & more.",
  keywords: "pooja kit, monthly subscription, deepa oil, agarbatti, camphor, sacred, spiritual",
  openGraph: {
    title: "SacredSamskara - Monthly Pooja Kit",
    description: "Premium monthly pooja essentials delivered to your doorstep.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${playfairDisplay.variable}`}>
      <head>
        {/* DNS prefetch + preconnect for zero-RTT Google Fonts loading */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/*
          Material Symbols: preload as style for priority hint, then load as
          stylesheet. The preload tag signals to the browser to fetch early
          without blocking render; the stylesheet tag applies it.
          eslint-disable-next-line @next/next/no-page-custom-font
        */}
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />

      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
