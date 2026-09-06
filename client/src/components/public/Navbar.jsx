import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/auth";
import { getCourses } from "../../services/api";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  Shield,
  Search,
  ChevronRight,
} from "lucide-react";

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setShowDropdown(false);
  }, [location.pathname]);

  // Lazy-load courses on first search open
  const loadCourses = useCallback(async () => {
    if (coursesLoaded) return;
    try {
      const res = await getCourses();
      if (res.success) setAllCourses(res.data || []);
    } catch {}
    setCoursesLoaded(true);
  }, [coursesLoaded]);

  const handleSearchOpen = () => {
    setSearchOpen(true);
    loadCourses();
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Filter results as user types
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const filtered = allCourses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.short_description?.toLowerCase().includes(q) ||
        c.level?.toLowerCase().includes(q)
    );
    setSearchResults(filtered.slice(0, 6));
    setShowDropdown(true);
  }, [searchQuery, allCourses]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
        if (!searchQuery) setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowDropdown(false);
      setSearchOpen(false);
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleResultClick = (courseId) => {
    setShowDropdown(false);
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/courses/${courseId}`);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 text-lg font-bold text-slate-900 tracking-tight group shrink-0">
          <img
            src="/images/akash-logo.jpg"
            alt="ThisIsAkashShow"
            className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition bg-slate-50"
            onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
          />
          <span className="font-black tracking-tight text-slate-900 text-lg sm:text-xl group-hover:text-emerald-600 transition hidden sm:block">
            ThisIsAkashShow
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden items-center gap-1 text-sm font-semibold text-slate-600 md:flex">
          <Link to="/" className="px-3.5 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-slate-100/70 transition">
            Home
          </Link>
          <Link to="/courses" className="px-3.5 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-slate-100/70 transition">
            Courses
          </Link>
          <Link to="/about" className="px-3.5 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-slate-100/70 transition">
            About
          </Link>
          <Link to="/contact" className="px-3.5 py-1.5 rounded-lg hover:text-emerald-600 hover:bg-slate-100/70 transition">
            Contact
          </Link>
        </div>

        {/* ── Search Bar (Desktop: expands inline; collapses to icon) ── */}
        <div ref={searchRef} className="hidden md:flex flex-1 max-w-sm items-center relative">
          {searchOpen ? (
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-emerald-400 focus-within:bg-white focus-within:shadow-md focus-within:shadow-emerald-100/60 transition-all duration-200">
                <Search size={15} className="ml-3 shrink-0 text-slate-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search courses..."
                  className="flex-1 py-2 px-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                  autoComplete="off"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(""); setShowDropdown(false); }}
                    className="mr-1.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setSearchOpen(false); setShowDropdown(false); }}
                    className="mr-1.5 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
                  {searchResults.length === 0 ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500">
                      <Search size={13} className="text-slate-300" />
                      No results for "{searchQuery}"
                    </div>
                  ) : (
                    <ul>
                      {searchResults.map((course) => (
                        <li key={course.id}>
                          <button
                            type="button"
                            onClick={() => handleResultClick(course.id)}
                            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50/60 transition group"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                              <BookOpen size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-emerald-700">{course.title}</p>
                              <p className="text-xs text-slate-400 truncate">{course.level || "All Levels"}</p>
                            </div>
                            <ChevronRight size={13} className="text-slate-300 group-hover:text-emerald-500 shrink-0 transition" />
                          </button>
                        </li>
                      ))}
                      <li className="border-t border-slate-100">
                        <button
                          type="submit"
                          className="flex w-full items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition"
                        >
                          <Search size={12} /> See all results for "{searchQuery}"
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
            </form>
          ) : (
            <button
              onClick={handleSearchOpen}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-400 hover:border-emerald-300 hover:bg-emerald-50/50 hover:text-emerald-600 transition w-full"
              aria-label="Search courses"
            >
              <Search size={15} />
              <span className="text-xs font-medium">Search courses...</span>
            </button>
          )}
        </div>

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-2.5 md:flex shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {profile?.role === "admin" ? (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition active:scale-95"
                >
                  <Shield size={14} /> Admin Portal
                </Link>
              ) : (
                <>
                  <Link
                    to="/student/courses"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-emerald-600 transition shadow-2xs"
                  >
                    <BookOpen size={14} /> My Courses
                  </Link>
                  <Link
                    to="/student/dashboard"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition active:scale-95"
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                to="/login"
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:text-emerald-600 hover:bg-slate-100/70 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-emerald-600 px-4.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 transition active:scale-95"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile: Search icon + Menu toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => { handleSearchOpen(); setMobileMenuOpen(false); }}
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 transition"
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-xl p-2 text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Search Bar (slides down when open) */}
      {searchOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-3" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="relative">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:border-emerald-400 focus-within:bg-white transition-all">
              <Search size={15} className="ml-3 shrink-0 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="flex-1 py-2.5 px-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                autoFocus
                autoComplete="off"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} className="mr-2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
              <button type="submit" className="m-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition">
                Go
              </button>
            </div>

            {/* Mobile dropdown */}
            {showDropdown && searchResults.length > 0 && (
              <div className="mt-1.5 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                <ul>
                  {searchResults.map((course) => (
                    <li key={course.id}>
                      <button
                        type="button"
                        onClick={() => handleResultClick(course.id)}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50/60 transition"
                      >
                        <BookOpen size={14} className="text-emerald-600 shrink-0" />
                        <span className="text-sm font-semibold text-slate-700 truncate">{course.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Mobile Nav Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur-md px-6 py-5 md:hidden space-y-4">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition">Home</Link>
            <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition">Courses</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition">About</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition">Contact</Link>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="text-xs text-slate-500 mb-1 px-1">
                  Signed in as: <span className="font-semibold text-slate-900">{user.email}</span>
                </div>
                {profile?.role === "admin" ? (
                  <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm">
                    Admin Portal
                  </Link>
                ) : (
                  <>
                    <Link to="/student/courses" onClick={() => setMobileMenuOpen(false)} className="w-full text-center rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800">
                      My Courses
                    </Link>
                    <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full text-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm">
                      Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-center rounded-xl border border-rose-200 bg-rose-50/50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100/60 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-center rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="text-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;