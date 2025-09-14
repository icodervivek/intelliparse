"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // ✅ Import
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname(); // ✅ Current route

  const toggleMenu = () => setIsOpen(!isOpen);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define routes separately
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav
      className={`fixed w-full z-50 border-b transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-md border-white/10 shadow-sm"
          : "bg-black border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 tracking-widest">
        <div className="flex justify-between items-center h-14 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0 text-xl sm:text-3xl font-extrabold tracking-wide">
            <Link href="/" className="flex items-center justify-center">
             Intelliparse
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-8 text-base sm:text-lg font-medium">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.path}
                className={`relative group transition-colors ${
                  pathname === link.path
                    ? "text-blue-400" // ✅ Active link color
                    : "text-white hover:text-blue-600"
                }`}
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="focus:outline-none cursor-pointer transition-colors p-2 rounded-md hover:bg-white/10"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-[#201f1f]/95 backdrop-blur-md overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen
            ? "max-h-52 opacity-100 px-6 pt-3 pb-5"
            : "max-h-0 opacity-0 px-0"
        }`}
      >
        {navLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.path}
            onClick={() => setIsOpen(false)}
            className={`block py-2 text-base font-semibold transition-colors ${
              pathname === link.path
                ? "text-blue-600" // ✅ Active link color
                : "text-white hover:text-blue-600"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;