import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../services/auth";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Sparkles,
} from "lucide-react";

const Navbar = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-lg transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 text-lg font-bold text-slate-900 tracking-tight group">
          <img
            src="/images/akash-logo.png"
            alt="ThisIsAkashShow"
            className="h-10 w-10 rounded-full object-cover border-2 border-emerald-500 shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition bg-slate-50"
            onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
          />
          <span className="font-black tracking-tight text-slate-900 text-lg sm:text-xl group-hover:text-emerald-600 transition">
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

        {/* Desktop Auth Controls */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
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

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 md:hidden"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white/95 backdrop-blur-md px-6 py-5 md:hidden space-y-4">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition"
            >
              Home
            </Link>
            <Link
              to="/courses"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition"
            >
              Courses
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition"
            >
              About
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition"
            >
              Contact
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-4 flex flex-col space-y-2">
            {user ? (
              <>
                <div className="text-xs text-slate-500 mb-1 px-1">
                  Signed in as: <span className="font-semibold text-slate-900">{user.email}</span>
                </div>
                {profile?.role === "admin" ? (
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm"
                  >
                    Admin Portal
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/student/courses"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-bold text-slate-800"
                    >
                      My Courses
                    </Link>
                    <Link
                      to="/student/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-center rounded-xl border border-rose-200 bg-rose-50/50 py-2 text-xs font-bold text-rose-600 hover:bg-rose-100/60 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;