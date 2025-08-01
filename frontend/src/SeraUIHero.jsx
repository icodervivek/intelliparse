import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import Navbar from "./Navbar";

const SeraUIHero = () => {
  const customCss = `
    /* This is the key to the seamless animation.
      The @property rule tells the browser that '--angle' is a custom property
      of type <angle>. This allows the browser to smoothly interpolate it
      during animations, preventing the "jump" at the end of the loop.
    */
    @property --angle {
      syntax: '<angle>';
      initial-value: 0deg;
      inherits: false;
    }

    /* The keyframe animation simply transitions the --angle property
      from its start (0deg) to its end (360deg).
    */
    @keyframes shimmer-spin {
      to {
        --angle: 360deg;
      }
    }
  `;

  return (
    <div className="w-full">
      <Navbar />

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-24 lg:pt-32 lg:pb-32">
          <div className="flex justify-center mb-6">
            <a
              href="#"
              className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1 text-xs sm:text-sm font-medium hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors"
            >
              <div className="flex -space-x-2">
                <img
                  className="w-5 h-5 rounded-full border border-white dark:border-slate-800"
                  src="https://i.pravatar.cc/150?img=1"
                  alt="User 1"
                />
                <img
                  className="w-5 h-5 rounded-full border border-white dark:border-slate-800"
                  src="https://i.pravatar.cc/150?img=2"
                  alt="User 2"
                />
                <img
                  className="w-5 h-5 rounded-full border border-white dark:border-slate-800"
                  src="https://i.pravatar.cc/150?img=3"
                  alt="User 3"
                />
              </div>
              <span className="text-slate-600 dark:text-slate-300 hidden sm:inline">
                Get AI-Powered PDF Insights
              </span>
              <span className="text-slate-600 dark:text-slate-300 sm:hidden">
                Explore The Platform
              </span>
              <ArrowRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </a>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-5xl md:text-6xl lg:text-7xl mb-6 overflow-y-hidden">
              Intelliparse – Smart PDF Analyzer
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl md:max-w-3xl mx-auto mb-10">
              Upload any PDF document and let AI instantly generate a concise
              summary and a set of frequently asked questions with answers.
              Perfect for quick reviews, understanding long documents, or
              extracting key information on the go.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center justify-center font-sans">
                <style>{customCss}</style>
                <button className="relative inline-flex items-center justify-center p-[1.5px] bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden group">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "conic-gradient(from var(--angle), transparent 25%, #06b6d4, transparent 50%)",
                      animation: "shimmer-spin 2.5s linear infinite",
                    }}
                  />
                  <Link
                    to="/signin"
                    className="relative z-10 inline-flex items-center justify-center w-full h-full px-8 py-3 text-gray-900 dark:text-white bg-white dark:bg-slate-800 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                  >
                    Get Started Free
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default SeraUIHero;
