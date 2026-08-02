import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import { Navbar } from "@/components/common/navbar";
import { Footer } from "@/components/common/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thekingshotel.com"),
  title: {
    default: "The Kings Hotel | Luxury Accommodation & Hospitality",
    template: "%s | The Kings Hotel",
  },
  description:
    "Experience world-class lodging, fine dining, and recreation at The Kings Hotel.",
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: "The Kings Hotel",
    title: "The Kings Hotel | Luxury Accommodation & Hospitality",
    description:
      "Experience world-class lodging, fine dining, and recreation at The Kings Hotel.",
    url: "https://thekingshotel.com",
  },
  twitter: {
    card: "summary",
    title: "The Kings Hotel | Luxury Accommodation & Hospitality",
    description:
      "Experience world-class lodging, fine dining, and recreation at The Kings Hotel.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen flex flex-col bg-background text-foreground`}>
        <SessionProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
