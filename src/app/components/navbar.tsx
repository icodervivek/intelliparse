"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => setIsOpen((s) => !s);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
  ];

  const isActive = (p: string) =>
    !!pathname && (pathname === p || pathname.startsWith(p + "/"));

  return (
    <nav
      aria-label="Main navigation"
      className={`fixed w-full z-50 border-b transition-all duration-500 ${
        scrolled
          ? "bg-black/60 backdrop-blur-md border-white/10 shadow-sm"
          : "bg-black border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 tracking-widest">
        <div className="flex justify-between items-center h-14 sm:h-20">
          {/* Logo */}
          <div className="text-xl sm:text-3xl font-extrabold">
            <Link href="/">Intelliparse</Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6 text-lg font-medium">
            {navLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.path}
                className={`relative group transition-colors ${
                  isActive(link.path)
                    ? "text-blue-400"
                    : "text-white hover:text-blue-600"
                }`}
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            ))}

            {/* Signed-out — simple Sign In link (gets active state) */}
            <SignedOut>
              <Link
                href="/sign-in"
                className={`relative group transition-colors ${
                  isActive("/sign-in")
                    ? "text-blue-400"
                    : "text-white hover:text-blue-600"
                }`}
              >
                Sign In
                <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            </SignedOut>

            {/* Signed-in — Profile link + UserButton (dropdown + sign out) */}
            <SignedIn>
              <div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
            className="md:hidden p-2 rounded-md hover:bg-white/10"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-[#201f1f]/95 backdrop-blur-md overflow-hidden transition-all duration-300 ${
          isOpen
            ? "max-h-72 opacity-100 px-6 pt-3 pb-5"
            : "max-h-0 opacity-0 px-0"
        }`}
      >
        {navLinks.map((link, idx) => (
          <Link
            key={idx}
            href={link.path}
            onClick={() => setIsOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isActive(link.path)
                ? "text-blue-600"
                : "text-white hover:text-blue-600"
            }`}
          >
            {link.name}
          </Link>
        ))}

        <SignedOut>
          <Link
            href="/sign-in"
            onClick={() => setIsOpen(false)}
            className={`block py-2 text-base font-semibold ${
              isActive("/sign-in")
                ? "text-blue-600"
                : "text-white hover:text-blue-600"
            }`}
          >
            Sign In
          </Link>
        </SignedOut>

        <SignedIn>
          <div className="pt-3">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
      </div>
    </nav>
  );
};

export default Navbar;
