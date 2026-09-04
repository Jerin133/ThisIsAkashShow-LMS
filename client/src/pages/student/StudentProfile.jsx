import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getStudentProfile, getMyEnrolledCourses } from "../../services/api";
import { supabase } from "../../lib/supabase";
import {
  User, Mail, Calendar, BookOpen, CheckCircle, Shield,
  AlertCircle, LogOut, TrendingUp, Award
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentProfile = () => {
  const { profile: authProfile } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [profileRes, coursesRes] = await Promise.all([
          getStudentProfile(),
          getMyEnrolledCourses(),
        ]);
        if (profileRes.success) {
          setProfile(profileRes.data);
        }
        if (coursesRes.success) setCourses(coursesRes.data || []);
      } catch (err) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const totalLessons = courses.reduce((s, c) => s + (c.totalLessons || 0), 0);
  const completedLessons = courses.reduce((s, c) => s + (c.completedLessons || 0), 0);
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = courses.filter((c) => c.progressPercent === 100).length;

  const initial = (profile?.full_name || authProfile?.full_name || "S")[0].toUpperCase();

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Account</p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Manage your account details and review your learning summary.</p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle size={18} /> <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-8 animate-pulse">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-gray-200 shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-5 w-1/3 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
              <div className="h-3 w-1/4 rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Profile Card */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
            {/* Top banner */}
            <div className="h-28 bg-gradient-to-r from-emerald-800 via-teal-700 to-slate-900 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            </div>

            <div className="px-6 pb-6">
              {/* Avatar */}
              <div className="flex items-end justify-between -mt-12 mb-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white text-3xl font-bold border-4 border-white shadow-md">
                    {initial}
                  </div>
                  <div className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 border-2 border-white">
                    <CheckCircle size={12} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Name */}
              <h2 className="text-2xl font-extrabold text-slate-900">{profile?.full_name || "Student User"}</h2>

              {/* Info rows */}
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                    <Mail size={15} />
                  </div>
                  <span className="text-gray-600">{profile?.email || authProfile?.email || "—"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 text-teal-600 shrink-0">
                    <Calendar size={15} />
                  </div>
                  <span className="text-gray-600">
                    Joined {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                    <Shield size={15} />
                  </div>
                  <span className="text-gray-600 capitalize">Role: {profile?.role || "Student"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Learning Stats */}
          <div>
            <h2 className="text-base font-bold text-gray-900 mb-4">Learning Summary</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: BookOpen, label: "Enrolled", value: courses.length, color: "bg-blue-50 text-blue-600" },
                { icon: CheckCircle, label: "Lessons Done", value: completedLessons, color: "bg-emerald-50 text-emerald-600" },
                { icon: TrendingUp, label: "Progress", value: `${overallPct}%`, color: "bg-emerald-100/70 text-emerald-700" },
                { icon: Award, label: "Completed", value: completedCourses, color: "bg-amber-50 text-amber-600" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl shrink-0 ${color}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">{label}</p>
                    <p className="text-xl font-bold text-gray-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enrolled Courses mini-list */}
          {courses.length > 0 && (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-base font-bold text-gray-900">Enrolled Courses</h2>
                <span className="text-xs text-gray-400">{courses.length} course{courses.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <div key={course.courseId} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/80 transition">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold shrink-0">
                      {(course.title || "C")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[120px]">
                          <div
                            className={`h-full rounded-full ${course.progressPercent === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400">{course.progressPercent}%</span>
                      </div>
                    </div>
                    {course.progressPercent === 100 && (
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1 border border-emerald-200">
                        Done
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Sign Out</h3>
              <p className="text-xs text-gray-400 mt-0.5">Securely log out of your account.</p>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentProfile;
