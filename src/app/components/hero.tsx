"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";


export default function Hero() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleRagClick = () => {
    if (!isSignedIn) {
      router.push("/sign-in");
    } else {
      router.push("/rag");
    }
  };
  return (
    <section className="relative w-full text-white overflow-hidden bg-gradient-to-b from-blue-950 via-[#201f1f] to-[#201f1f] group select-none tracking-widest">
      {/* Gradient Glows */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Blue Glow Top Right (hover) */}
        <div
          className="
          absolute -top-20 -right-20 
          w-[300px] h-[300px] 
          sm:w-[400px] sm:h-[400px] 
          md:w-[500px] md:h-[500px] 
          lg:w-[600px] lg:h-[600px] 
          xl:w-[700px] xl:h-[700px] 
          bg-blue-500/60 rounded-full blur-[120px] sm:blur-[150px] md:blur-[180px] lg:blur-[200px] 
          opacity-0 group-hover:opacity-60 transition duration-500
        "
        />

        {/* Purple Glow Bottom Left (hover) */}
        <div
          className="
          absolute -bottom-20 -left-20 
          w-[250px] h-[250px] 
          sm:w-[350px] sm:h-[350px] 
          md:w-[450px] md:h-[450px] 
          lg:w-[550px] lg:h-[550px] 
          xl:w-[600px] xl:h-[600px] 
          bg-purple-500/50 rounded-full blur-[100px] sm:blur-[140px] md:blur-[160px] lg:blur-[180px] 
          opacity-0 group-hover:opacity-50 transition duration-500
        "
        />
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-20 sm:py-28 text-center">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs sm:text-sm mb-6"
        >
          <span>✨ Get AI-Powered Document Insights</span>
          <ArrowRight className="w-4 h-4" />
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight"
        >
          Intelliparse –{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Smart Document Analyzer
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-6 text-base sm:text-lg text-gray-300 leading-relaxed px-2"
        >
          Upload PDFs, text, or URLs and let AI analyze them. With
          Intelliparse’s RAG system, chat directly with your documents to get
          instant summaries, insights, and answers — all in one place.
        </motion.p>

        {/* CTA Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/parse" className="w-64">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="w-full"
            >
              <button
                className="w-full px-8 py-4 rounded-xl 
        bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 
        text-white font-semibold shadow-lg 
        hover:shadow-blue-700/50 transition cursor-pointer"
              >
                Summarise PDF
              </button>
            </motion.div>
          </Link>

          {/* <Link href="/rag" className="w-64"> */}
            <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-64"
        >
          <button
            onClick={handleRagClick}
            className="w-full px-8 py-4 rounded-xl 
              bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 
              text-white font-semibold shadow-lg 
              hover:shadow-blue-700/50 transition cursor-pointer"
          >
            Try Our RAG
          </button>
        </motion.div>
          {/* </Link> */}
        </div>
      </div>
    </section>
  );
}
