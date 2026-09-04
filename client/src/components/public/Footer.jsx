import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          <div className="md:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-3 text-lg font-bold text-slate-900 tracking-tight">
              <img
                src="/images/akash-logo.png"
                alt="ThisIsAkashShow"
                className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm bg-slate-50"
                onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
              />
              <span className="font-black tracking-tight text-slate-900 text-lg">
                ThisIsAkashShow
              </span>
            </Link>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              Curated stock market courses, live trading breakdown modules, and DRM-protected video streaming by Akash.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li><Link to="/courses" className="hover:text-emerald-600 transition">All Courses</Link></li>
              <li><Link to="/about" className="hover:text-emerald-600 transition">About Academy</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-600 transition">Support & Help</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Account</h4>
            <ul className="space-y-2 text-xs font-semibold text-slate-600">
              <li><Link to="/login" className="hover:text-emerald-600 transition">Student Sign In</Link></li>
              <li><Link to="/register" className="hover:text-emerald-600 transition">Create Account</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
          <p>© 2026 ThisIsAkashShow. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>256-bit SSL DRM Protected</span>
            <span>•</span>
            <span>Anti-Piracy Enabled</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;