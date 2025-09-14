import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "About Intelliparse",
  description: "Upload your PDFs and get instant AI-generated summaries and FAQs.",
};

export default function UploadLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-new-gr-c-s-check-loaded="14.1253.0"
        data-gr-ext-installed=""
      >
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
