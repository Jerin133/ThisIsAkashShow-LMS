import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";

const StudentSidebar = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "My Courses", path: "/student/courses", icon: BookOpen },
    { name: "My Progress", path: "/student/progress", icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const initial = (profile?.full_name || "S")[0].toUpperCase();

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200/80 bg-white md:flex shadow-2xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4.5">
        <img
          src="/images/akash-logo.png"
          alt="ThisIsAkashShow"
          className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm bg-slate-50"
          onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
        />
        <div>
          <p className="text-sm font-black text-slate-900 tracking-tight leading-tight">ThisIsAkashShow</p>
          <p className="text-[11px] text-emerald-600 font-bold">Student Portal</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-4">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                  isActive
                    ? "bg-emerald-50 text-emerald-700 shadow-2xs border border-emerald-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={17} />
              {link.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom — Profile + Logout */}
      <div className="border-t border-slate-100 p-3 space-y-1">
        {/* Profile link */}
        <NavLink
          to="/student/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
              isActive
                ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-100"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-xs font-bold shrink-0 shadow-2xs">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-900 truncate">
              {profile?.full_name || "My Profile"}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {profile?.email || ""}
            </p>
          </div>
        </NavLink>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default StudentSidebar;