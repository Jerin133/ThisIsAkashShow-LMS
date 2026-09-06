import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyEnrolledCourses } from "../../services/api";
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Play,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const StudentDashboard = () => {
  const { profile } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await getMyEnrolledCourses();
        if (res.success) {
          setCourses(res.data || []);
        }
      } catch (err) {
        console.warn("Could not fetch enrolled courses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats aggregation
  const totalEnrolled = courses.length;
  let totalCompletedLessons = 0;
  let totalAllLessons = 0;

  courses.forEach((c) => {
    totalCompletedLessons += c.completedLessons || 0;
    totalAllLessons += c.totalLessons || 0;
  });

  const overallProgress =
    totalAllLessons > 0
      ? Math.round((totalCompletedLessons / totalAllLessons) * 100)
      : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white p-8 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-700 mb-3 shadow-2xs">
            <Sparkles size={14} className="text-emerald-600" /> Student Workspace
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back, {profile?.full_name || "Student"} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-xl leading-relaxed">
            Track your progress, continue watching lectures, and access your study materials anytime.
          </p>
        </div>

        <Link
          to="/courses"
          className="relative z-10 w-fit rounded-xl bg-emerald-600 px-5.5 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition active:scale-95 shadow-sm shadow-emerald-500/25"
        >
          Browse New Courses
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Enrolled Courses
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalEnrolled}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Completed Lessons
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{totalCompletedLessons}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Learning Progress
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{overallProgress}%</p>
          </div>
        </div>

      </div>

      {/* Continue Learning Section */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
          <Link
            to="/student/courses"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            View All ({courses.length}) <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400">
            Loading your courses...
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
            <BookOpen size={36} className="mx-auto text-gray-400 mb-3" />
            <h3 className="text-base font-semibold text-gray-800">
              No active courses found
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Enroll in a course from our catalog to get started.
            </p>
            <Link
              to="/courses"
              className="mt-4 inline-block rounded-xl bg-black px-5 py-2 text-xs font-semibold text-white"
            >
              Explore Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 3).map((item) => (
              <div
                key={item.enrollmentId}
                className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                  <img
                    src={item.thumbnailUrl || "/images/digital-marketing-cartoon.jpg"}
                    alt={item.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "/images/digital-marketing-cartoon.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute bottom-3 left-3 rounded-full bg-slate-950/80 backdrop-blur-xs border border-white/20 text-emerald-300 px-2.5 py-0.5 text-xs font-semibold">
                    {item.progressPercent}% Completed
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                      {item.shortDescription || "Continue with your video lectures and notes."}
                    </p>
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">
                      {item.completedLessons} / {item.totalLessons} Lessons
                    </span>
                    <Link
                      to={`/learn/${item.courseId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs shadow-emerald-500/20 transition active:scale-95"
                    >
                      <Play size={13} /> Continue
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;