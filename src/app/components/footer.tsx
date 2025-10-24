import React from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { FaX } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="w-full tracking-widest bg-[#1a1a1a] text-gray-300 px-6 py-10 mt-20 border-t border-gray-800 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute -bottom-[100px] -left-[100px] w-[500px] h-[500px] rounded-full  blur-3xl pointer-events-none"></div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        {/* Brand */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold">
            Intelliparse
          </h2>
          <p className="text-sm text-gray-400">Smart Document Analyzer</p>
        </div>

        {/* Links */}
        <div className="flex space-x-6 text-gray-400 text-lg">
          <a
            href="https://www.github.com/icodervivek"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-300"
            aria-label="Github"
          >
            <FaGithub />
          </a>
          <a
            href="https://www.linkedin.com/in/vivekpramanik"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-300"
            aria-label="Linkedin"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://www.x.com/icodervivek"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-300"
            aria-label="X"
          >
            <FaX />
          </a>
         
        </div>
      </div>

      {/* Bottom */}
      <div className="text-center text-gray-500 text-sm mt-6 relative z-10">
        © {new Date().getFullYear()} Intelliparse. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
