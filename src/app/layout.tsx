import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Intelliparse – Smart Document Analyzer",
  description:
    "Intelliparse is an AI-powered platform to upload PDFs, extract key insights, generate summaries and FAQs, and interact with your documents through an intelligent RAG-powered chat interface. Perfect for students, researchers, and professionals seeking fast document comprehension.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          data-new-gr-c-s-check-loaded="14.1253.0"
          data-gr-ext-installed=""
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
