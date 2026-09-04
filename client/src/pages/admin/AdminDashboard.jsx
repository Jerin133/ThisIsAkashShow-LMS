import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAdminStats } from "../../services/api";
import {
  Users,
  BookOpen,
  CreditCard,
  TrendingUp,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const AdminDashboard = () => {
  const { profile } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCourses: 0,
    activeEnrollments: 0,
    totalRevenue: 0,
    recentPayments: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getAdminStats();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn("Could not load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formattedRevenue = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(stats.totalRevenue || 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-700 mb-2.5 shadow-2xs">
            <Sparkles size={13} className="text-emerald-600" /> Administrator Portal
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {profile?.full_name || "Admin"} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your courses, curriculum lectures, student enrollments, and revenue metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/courses/create"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Plus size={16} /> Create Course
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Students
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {loading ? "..." : stats.totalStudents}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Courses
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {loading ? "..." : stats.totalCourses}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Active Enrollments
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {loading ? "..." : stats.activeEnrollments}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <CreditCard size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Revenue
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {loading ? "..." : formattedRevenue}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Purchases & Quick Links */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Recent Transactions Table */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Recent Enrollments & Payments</h2>
            <Link
              to="/admin/payments"
              className="text-xs font-semibold text-black hover:underline flex items-center gap-1"
            >
              View All <ArrowRight size={13} />
            </Link>
          </div>

          {stats.recentPayments?.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b text-gray-400">
                    <th className="pb-3 font-semibold">Student</th>
                    <th className="pb-3 font-semibold">Course</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats.recentPayments.slice(0, 5).map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50/50">
                      <td className="py-3 font-medium text-gray-900">
                        {pay.profiles?.full_name || pay.profiles?.email || "Student"}
                      </td>
                      <td className="py-3 text-gray-600">
                        {pay.courses?.title || "Course"}
                      </td>
                      <td className="py-3 font-bold text-emerald-600">
                        ₹{Number(pay.amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-gray-400">
                        {new Date(pay.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            <p className="text-xs text-gray-500 mt-1">
              Common tasks to manage your academy portal.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/admin/courses"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              <span>Manage Courses & Lectures</span>
              <ArrowRight size={14} className="text-gray-400" />
            </Link>

            <Link
              to="/admin/students"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              <span>View Registered Students</span>
              <ArrowRight size={14} className="text-gray-400" />
            </Link>

            <Link
              to="/admin/payments"
              className="flex items-center justify-between rounded-xl border border-gray-100 p-3.5 text-xs font-semibold text-gray-800 hover:bg-gray-50 transition"
            >
              <span>Payment Audits & Invoices</span>
              <ArrowRight size={14} className="text-gray-400" />
            </Link>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 text-xs text-gray-500">
            🔒 Content Protection is active on all uploaded course videos and notes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;