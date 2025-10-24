"use client";

import React from "react";
import { motion } from "framer-motion";
import { WobbleCard } from "./WobbleCard";

export function WobbleCardDemo() {
  return (
    <div
      id="about"
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full overflow-hidden p-2 tracking-widest"
    >
      {/* First Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="col-span-1 lg:col-span-2 h-full"
      >
        <WobbleCard
          containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
          className="overflow-hidden"
        >
          <div className="max-w-xs">
            <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white overflow-y-hidden">
              Turn Lengthy PDFs into Actionable Insights
            </h2>
            <p className="mt-4 text-left text-base/6 text-neutral-200">
              Designed for professionals who value time. Upload reports, get
              straight-to-the-point summaries and FAQs in seconds.
            </p>
          </div>
          <img
            src="/ss1.jpg"
            width={500}
            height={500}
            alt="linear demo image"
            className="mt-8 md:absolute -right-4 lg:-right-[20%] grayscale filter -bottom-10 object-contain rounded-2xl"
          />
        </WobbleCard>
      </motion.div>

      {/* Second Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true }}
        className="col-span-1"
      >
        <WobbleCard
          className="overflow-hidden"
          containerClassName="col-span-1 min-h-[300px]"
        >
          <h2 className="max-w-80 text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white overflow-y-hidden">
            Chat with Your Documents, URLs, and Text Instantly
          </h2>
          <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
            Upload PDFs, paste text, or provide URLs — Intelliparse’s RAG system
            lets you interact with your data, generating summaries, insights,
            and answers in real-time.
          </p>
        </WobbleCard>
      </motion.div>

      {/* Third Card */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        viewport={{ once: true }}
        className="col-span-1 lg:col-span-3"
      >
        <WobbleCard
          className="overflow-hidden"
          containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]"
        >
          <div className="max-w-sm">
            <h2 className="max-w-sm md:max-w-lg text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white overflow-y-hidden">
              Unlock Insights from Any Document or URL
            </h2>
            <p className="mt-4 max-w-[26rem] text-left text-base/6 text-neutral-200">
              Let AI process PDFs, text, and web pages to provide concise
              summaries, answer questions, and highlight key points — all
              instantly.
            </p>
          </div>
          <img
            src="/ss3.png"
            width={500}
            height={500}
            alt="linear demo image"
            className="mt-8 md:absolute md:-right-[20%] lg:-right-[2%] -bottom-1 object-contain rounded-2xl"
          />
        </WobbleCard>
      </motion.div>
    </div>
  );
}
