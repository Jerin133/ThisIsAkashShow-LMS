import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import AdminSidebar from "../components/admin/AdminSidebar";
import {
  LayoutDashboard, BookOpen, Users, BarChart3, CreditCard, Menu, X, LogOut,
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Courses", path: "/admin/courses", icon: BookOpen },
    { name: "Students", path: "/admin/students", icon: Users },
    { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    { name: "Payments", path: "/admin/payments", icon: CreditCard },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <AdminSidebar />

      {/* Mobile Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 md:hidden shadow-sm">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/akash-logo.png"
            alt="ThisIsAkashShow"
            className="h-8 w-8 rounded-full object-cover border-2 border-emerald-500 bg-slate-50"
            onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
          />
          <div>
            <p className="text-sm font-black text-slate-900 leading-tight">ThisIsAkashShow</p>
            <p className="text-[10px] text-emerald-600 font-bold leading-tight">Admin Workspace</p>
          </div>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer Panel */}
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div className="flex items-center gap-3">
                <img
                  src="/images/akash-logo.png"
                  alt="ThisIsAkashShow"
                  className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500 bg-slate-50"
                  onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
                />
                <div>
                  <p className="text-sm font-black text-slate-900">ThisIsAkashShow</p>
                  <p className="text-[11px] text-emerald-600 font-bold">Admin Workspace</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-1.5 overflow-y-auto px-3.5 py-4">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    onClick={() => setDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`
                    }
                  >
                    <Icon size={18} />
                    {link.name}
                  </NavLink>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-slate-100 p-3">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 min-h-screen overflow-y-auto pt-[57px] md:pt-0 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg md:hidden">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[9px] font-bold transition ${
                  isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-700"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`flex h-7 w-7 items-center justify-center rounded-xl transition ${isActive ? "bg-emerald-50" : ""}`}>
                    <Icon size={17} />
                  </span>
                  {link.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default AdminLayout;