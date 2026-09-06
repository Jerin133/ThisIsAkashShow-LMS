import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyEnrolledCourses } from "../../services/api";
import { BookOpen, Play, Clock, Sparkles, AlertCircle } from "lucide-react";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await getMyEnrolledCourses();
        if (res.success) {
          setCourses(res.data || []);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message || "Failed to load enrolled courses");
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Learning Portal
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">My Enrolled Courses</h1>
        <p className="mt-2 text-gray-600">
          Continue your lessons where you left off and track your learning milestones.
        </p>
      </div>

      {error && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Course Cards Grid */}
      {loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="h-44 rounded-xl bg-gray-200 mb-4" />
              <div className="h-5 w-3/4 rounded bg-gray-200 mb-2" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
            <BookOpen size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">You haven't enrolled in any courses yet</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Explore our curriculum of expert-led courses to start building your technical skills.
          </p>
          <Link
            to="/courses"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <Sparkles size={16} />
            Explore Course Catalog
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((item) => (
            <div
              key={item.enrollmentId}
              className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-md hover:border-emerald-300/80 transition-all duration-300 group"
            >
              {/* Clean Light Thumbnail / Header */}
              <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-slate-100 flex flex-col justify-between p-5">
                <img
                  src={item.thumbnailUrl || "/images/digital-marketing-cartoon.jpg"}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "/images/digital-marketing-cartoon.jpg";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/20" />
                <span className="w-fit rounded-lg bg-white/95 backdrop-blur-xs px-2.5 py-1 text-xs font-bold text-emerald-800 shadow-2xs border border-white/60 z-10">
                  {item.level || "Beginner"}
                </span>
                <div className="z-10">
                  <h3 className="font-extrabold text-lg text-white leading-snug line-clamp-1 group-hover:text-emerald-300 transition-colors drop-shadow-xs">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-200 flex items-center gap-1.5 mt-1 font-medium">
                    <Clock size={13} className="text-emerald-400" /> {item.duration || "Self-Paced"} • {item.totalLessons} Lessons
                  </p>
                </div>
              </div>

              {/* Progress & Details */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-2">
                    <span>Course Progress</span>
                    <span className="text-emerald-600">{item.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-400 font-medium">
                    {item.completedLessons} of {item.totalLessons} lessons completed
                  </p>
                </div>

                <Link
                  to={`/learn/${item.courseId}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 active:scale-95"
                >
                  <Play size={16} />
                  {item.progressPercent > 0 ? "Continue Learning" : "Start Learning"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
