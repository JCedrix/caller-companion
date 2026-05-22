import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { IdentityProvider } from "@/components/IdentityProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
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
    <html lang="en" className={inter.variable}>
      <body className="bg-bg text-text-primary font-sans min-h-screen">
        <IdentityProvider>
          <Header />
          <main className="max-w-content mx-auto px-6 py-10">{children}</main>
        </IdentityProvider>
      </body>
    </html>
  );
}
