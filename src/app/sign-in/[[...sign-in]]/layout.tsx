import type { ReactNode } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "Sign In - Intelliparse",
  description: "Upload PDFs and instantly get summaries, FAQs, and AI-powered insights.",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Open Graph / Social sharing */}
        <meta property="og:title" content={metadata.title} />
        <meta property="og:description" content={metadata.description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="font-sans min-h-screen flex flex-col bg-[#201f1f] text-white">
          {/* Navbar fixed */}
          <Navbar />

          {/* Main content grows */}
          <main className="flex-1 pt-16">{children}</main>

          {/* Footer stays at bottom */}
          <Footer />
        </div>
      </body>
    </html>
  );
}
