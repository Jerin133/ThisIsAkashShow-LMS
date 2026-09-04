import React, { useEffect, useState } from "react";
import { getAdminAnalytics } from "../../services/api";
import {
  BarChart3, TrendingUp, Users, IndianRupee,
  BookOpen, Award, AlertCircle, ArrowUpRight, CheckCircle2
} from "lucide-react";

// Simple bar chart using divs (no external chart library needed)
const BarChart = ({ data, maxValue }) => (
  <div className="flex items-end gap-2 h-40">
    {data.map(({ month, revenue }) => {
      const heightPct = maxValue > 0 ? (revenue / maxValue) * 100 : 0;
      return (
        <div key={month} className="flex flex-1 flex-col items-center gap-1.5 group">
          <div className="relative w-full flex flex-col justify-end" style={{ height: "120px" }}>
            <div
              className="w-full rounded-t-lg bg-emerald-500 transition-all duration-700 group-hover:bg-emerald-400 relative"
              style={{ height: `${Math.max(heightPct, 2)}%` }}
            >
              {revenue > 0 && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-bold text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  ₹{revenue.toLocaleString("en-IN")}
                </div>
              )}
            </div>
          </div>
          <span className="text-[10px] text-gray-500 font-medium">{month}</span>
        </div>
      );
    })}
  </div>
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await getAdminAnalytics();
        if (res.success) setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const maxRevenue = data
    ? Math.max(...(data.monthlyRevenue || []).map((m) => m.revenue), 1)
    : 1;

  const StatCard = ({ icon: Icon, label, value, sub, color }) => (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex items-start gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900 truncate">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Insights</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Revenue trends, course performance, and enrollment insights.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white border border-gray-100 p-6 h-28" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={IndianRupee}
              label="Total Revenue"
              value={`₹${(data.totalRevenue || 0).toLocaleString("en-IN")}`}
              sub="All time (successful payments)"
              color="bg-emerald-50 text-emerald-600"
            />
            <StatCard
              icon={Users}
              label="Total Enrollments"
              value={data.totalEnrollments || 0}
              sub="Active course enrollments"
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completion Rate"
              value={`${data.completionRate || 0}%`}
              sub="Lessons marked as complete"
              color="bg-teal-50 text-teal-600"
            />
            <StatCard
              icon={Award}
              label="Top Course"
              value={data.topCourse?.title ? data.topCourse.title.slice(0, 18) + (data.topCourse.title.length > 18 ? "…" : "") : "—"}
              sub={data.topCourse ? `${data.topCourse.enrollments} enrollments` : "No data yet"}
              color="bg-amber-50 text-amber-600"
            />
          </div>

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Monthly Revenue Bar Chart */}
            <div className="lg:col-span-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Monthly Revenue</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Last 6 months — successful payments</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <TrendingUp size={12} /> Revenue
                </div>
              </div>
              {(data.monthlyRevenue || []).every((m) => m.revenue === 0) ? (
                <div className="flex h-40 items-center justify-center text-sm text-gray-400">
                  No revenue data for the last 6 months
                </div>
              ) : (
                <BarChart data={data.monthlyRevenue || []} maxValue={maxRevenue} />
              )}
            </div>

            {/* Top Courses Donut */}
            <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
              <h2 className="text-base font-bold text-gray-900 mb-1">Course Breakdown</h2>
              <p className="text-xs text-gray-500 mb-6">Enrollments by course</p>
              {(data.courseBreakdown || []).length === 0 ? (
                <div className="flex h-40 items-center justify-center text-sm text-gray-400">No enrollment data yet</div>
              ) : (
                <div className="space-y-3">
                  {(data.courseBreakdown || []).slice(0, 5).map((course, idx) => {
                    const maxEnroll = Math.max(...data.courseBreakdown.map((c) => c.enrollments), 1);
                    const pct = Math.round((course.enrollments / maxEnroll) * 100);
                    const colors = ["bg-emerald-500", "bg-teal-500", "bg-blue-500", "bg-amber-500", "bg-emerald-600"];
                    return (
                      <div key={course.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-700 line-clamp-1 max-w-[160px]">{course.title}</span>
                          <span className="text-xs font-bold text-gray-900">{course.enrollments}</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-700`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Course Performance Table */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-900">Course Performance</h2>
                <p className="text-xs text-gray-500 mt-0.5">Enrollments and revenue per course</p>
              </div>
              <BookOpen size={18} className="text-gray-400" />
            </div>
            {(data.courseBreakdown || []).length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-400">
                No course data yet. Publish courses and wait for enrollments.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">#</th>
                      <th className="px-6 py-3.5">Course</th>
                      <th className="px-6 py-3.5">Level</th>
                      <th className="px-6 py-3.5">Enrollments</th>
                      <th className="px-6 py-3.5">Revenue</th>
                      <th className="px-6 py-3.5">Avg. per Student</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(data.courseBreakdown || []).map((course, idx) => (
                      <tr key={course.id} className="hover:bg-gray-50/80 transition">
                        <td className="px-6 py-4 text-sm font-bold text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0">
                              {course.title[0]}
                            </div>
                            <span className="font-semibold text-gray-900 text-sm line-clamp-1">{course.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold">
                            {course.level || "All Levels"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{course.enrollments}</span>
                            <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min((course.enrollments / Math.max(...data.courseBreakdown.map((c) => c.enrollments), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-emerald-700">
                          ₹{(course.revenue || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          ₹{course.enrollments > 0 ? Math.round(course.revenue / course.enrollments).toLocaleString("en-IN") : "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminAnalytics;
