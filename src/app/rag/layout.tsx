import type { ReactNode } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

interface RootLayoutProps {
  children: ReactNode;
}

export const metadata = {
  title: "RAG - Intelliparse",
  description:
    "RAG Chat with AI Assistant is an interactive AI chat interface that lets users upload PDFs, text, or URLs as context. It provides intelligent, context-aware responses, supports code and link highlighting, and saves chat history and sources locally for a seamless experience.",
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
      <body className={`antialiased`}>
        <div className="font-sans min-h-screen flex flex-col bg-[#201f1f] text-white">
          {/* Navbar fixed */}
          <SignedIn>
            <Navbar />

            {/* Main content grows */}
            <main className="flex-1 pt-16">{children}</main>

            {/* Footer stays at bottom */}
            <Footer />
          </SignedIn>

          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </div>
      </body>
    </html>
  );
}
