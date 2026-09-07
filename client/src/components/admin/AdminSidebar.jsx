import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  CreditCard,
  LogOut,
  Sparkles,
  Megaphone,
} from "lucide-react";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const links = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
    { name: "Affiliate Ads", path: "/admin/ads", icon: Megaphone },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-slate-200/80 bg-white md:flex shadow-2xs">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4.5">
        <img
          src="/images/akash-logo.jpg"
          alt="ThisIsAkashShow"
          className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm bg-slate-50"
          onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
        />
        <div>
          <p className="text-sm font-black text-slate-900 tracking-tight leading-tight">ThisIsAkashShow</p>
          <p className="text-[11px] text-emerald-600 font-bold">Admin Workspace</p>
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
                `flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition ${isActive
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

      {/* Bottom — Sign Out */}
      <div className="border-t border-slate-100 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;