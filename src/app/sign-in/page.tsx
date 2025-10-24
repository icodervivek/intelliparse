"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { SignIn as ClerkSignIn } from "@clerk/nextjs"; // rename import

export default function SignUpPage() {
  // rename this function too
  return (
    <section className="relative w-full text-white overflow-hidden bg-gradient-to-br from-blue-950 via-[#201f1f] to-[#201f1f] py-20 px-6 sm:px-12">
      {/* Background Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-500/60 rounded-full blur-[180px] opacity-40" />
        <div className="absolute -bottom-20 -left-20 w-[450px] h-[450px] bg-purple-500/50 rounded-full blur-[160px] opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto text-center flex  justify-center"
      >
        <ClerkSignIn afterSignInUrl="/" afterSignUpUrl="/"  />
      </motion.div>
    </section>
  );
}
