"use client";

import { motion } from "framer-motion";

export default function About() {
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
        className="max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
          About{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Intelliparse
          </span>
        </h2>
        <p className="text-gray-300 sm:text-lg mb-8 leading-relaxed">
          Upload PDFs, text, or URLs and let AI analyze them. With
          Intelliparse’s RAG system, chat directly with your documents to get
          instant summaries, insights, and answers — all in one place.
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10"
        >
          <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">
              Fast Summaries
            </h3>
            <p className="text-gray-300 text-left">
              Get concise summaries of any PDF instantly, saving time and effort
              while ensuring you capture the essence of the document.
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">
              Smart FAQs
            </h3>
            <p className="text-gray-300 text-left">
              Automatically generate frequently asked questions and answers
              based on the content of your PDFs for better understanding and
              quick reference.
            </p>
          </div>
          <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-lg border border-gray-800">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">
              Interactive Experience
            </h3>
            <p className="text-gray-300 text-left">
              Engage with your documents using AI chat and interactive tools to
              find answers, clarify points, and explore content dynamically.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
