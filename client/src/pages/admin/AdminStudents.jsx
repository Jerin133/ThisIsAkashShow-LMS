import React, { useEffect, useState } from "react";
import { getAdminStudents } from "../../services/api";
import {
  Users, Mail, BookOpen, Calendar, AlertCircle, Search, Download, TrendingUp
} from "lucide-react";

const AVATAR_COLORS = [
  "bg-emerald-600", "bg-teal-600", "bg-blue-600", "bg-amber-600",
  "bg-emerald-500", "bg-green-600", "bg-teal-500", "bg-cyan-600",
];

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const res = await getAdminStudents();
        if (res.success) {
          setStudents(res.data || []);
          setFiltered(res.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      students.filter(
        (s) =>
          (s.fullName || "").toLowerCase().includes(q) ||
          (s.email || "").toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  const totalEnrollments = students.reduce((sum, s) => sum + (s.enrolledCount || 0), 0);

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
      <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shrink-0`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">User Management</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">Enrolled Students</h1>
        <p className="mt-1 text-sm text-slate-500">View all registered students and their course enrollments.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard icon={Users} label="Total Students" value={students.length} color="bg-emerald-50 text-emerald-600" />
        <StatCard icon={BookOpen} label="Total Enrollments" value={totalEnrollments} color="bg-blue-50 text-blue-600" />
        <StatCard icon={TrendingUp} label="Avg. Courses / Student" value={students.length > 0 ? (totalEnrollments / students.length).toFixed(1) : "0"} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-6 py-4 flex-wrap">
          <div className="relative max-w-xs w-full">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
            {filtered.length} of {students.length} students
          </div>
        </div>

        {loading ? (
          <div className="space-y-0 divide-y divide-gray-100">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="mx-auto text-gray-300 mb-3" />
            <h3 className="font-bold text-gray-800">{search ? "No students match your search" : "No students registered yet"}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {search ? "Try a different name or email." : "When learners sign up and purchase courses, they will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5">Enrollments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((student, idx) => {
                  const initial = student.fullName ? student.fullName[0].toUpperCase() : "S";
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <tr key={student.id} className="hover:bg-gray-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 items-center justify-center rounded-full ${avatarColor} text-white text-xs font-bold shrink-0`}>
                            {initial}
                          </div>
                          <span className="font-semibold text-gray-900">{student.fullName || "Student User"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Mail size={13} className="text-gray-400" />
                          {student.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          {new Date(student.joinedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${student.enrolledCount > 0 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"}`}>
                          <BookOpen size={11} />
                          {student.enrolledCount} Course{student.enrolledCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
