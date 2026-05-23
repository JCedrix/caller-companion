import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { IdentityProvider } from "@/components/IdentityProvider";
import { AmbientBackground } from "@/components/AmbientBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Caller Companion",
  description: "Pre-call briefing for cold call agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="bg-bg text-text-primary font-sans min-h-screen">
        <IdentityProvider>
          <AmbientBackground />
          <Header />
          <main className="max-w-content mx-auto px-6 py-10">{children}</main>
        </IdentityProvider>
      </body>
    </html>
  );
}
