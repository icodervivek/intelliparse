import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ArrowRight, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { Bounce, toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const navRef = useRef(null);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    toast.success("Signout Successful", {
      position: "top-center",
      autoClose: 2000,
      transition: Bounce,
    });
    navigate("/signin");
  };

  const handleDropdownToggle = (title) => {
    setOpenDropdown((prev) => (prev === title ? null : title));
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full">
      <nav
        ref={navRef}
        className="relative z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 sticky top-0"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="text-xl font-bold text-slate-900 dark:text-slate-100"
            >
              Intelliparse
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/form"
                    className="h-9 px-4 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
                  >
                    Parse PDF
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="h-9 px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md text-sm font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <HashLink
                    to="#about"
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                  >
                    About
                  </HashLink>
                  <Link
                    to="/signup"
                    className="h-9 px-4 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>

            {/* Hamburger Icon */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
            <div className="px-4 py-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/form"
                    className="block w-full text-left px-4 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 rounded-md text-sm"
                  >
                    Parse PDF
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-md text-sm"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <HashLink
                    to="#about"
                    className="block text-base font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  >
                    About
                  </HashLink>
                  <Link
                    to="/signup"
                    className="block w-full text-left px-4 py-2 bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 rounded-md text-sm"
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
