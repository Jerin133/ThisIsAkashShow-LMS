import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyProgress } from "../../services/api";
import {
  BookOpen, CheckCircle, Circle, Play,
  TrendingUp, Award, Target, AlertCircle, ChevronDown, ChevronUp
} from "lucide-react";

const ProgressRing = ({ percent, size = 80, stroke = 7 }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  const color = percent === 100 ? "#10b981" : percent >= 50 ? "#3b82f6" : "#f59e0b";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }}
      />
    </svg>
  );
};

const StudentProgress = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await getMyProgress();
        if (res.success) setCourses(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load progress");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const toggleExpand = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const totalLessons = courses.reduce((s, c) => s + c.totalLessons, 0);
  const completedLessons = courses.reduce((s, c) => s + c.completedLessons, 0);
  const overallPct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = courses.filter((c) => c.progressPercent === 100).length;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-7">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Learning Tracker</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">My Progress</h1>
        <p className="mt-1 text-sm text-slate-500">
          Track your lesson completion and learning journey across all enrolled courses.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <AlertCircle size={18} /> <span>{error}</span>
        </div>
      )}

      {/* Summary Cards */}
      {!loading && (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpen, label: "Enrolled Courses", value: courses.length, color: "bg-emerald-50 text-emerald-600" },
            { icon: CheckCircle, label: "Lessons Completed", value: completedLessons, color: "bg-teal-50 text-teal-600" },
            { icon: TrendingUp, label: "Overall Progress", value: `${overallPct}%`, color: "bg-blue-50 text-blue-600" },
            { icon: Target, label: "Completed Courses", value: completedCourses, color: "bg-emerald-100/70 text-emerald-700" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl shrink-0 ${color}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Overall Progress Bar */}
      {!loading && courses.length > 0 && (
        <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Overall Completion</h2>
              <p className="text-xs text-slate-500 mt-0.5">{completedLessons} of {totalLessons} lessons completed</p>
            </div>
            <span className={`text-2xl font-extrabold ${overallPct === 100 ? "text-emerald-600" : overallPct >= 50 ? "text-emerald-600" : "text-amber-600"}`}>
              {overallPct}%
            </span>
          </div>
          <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${overallPct === 100 ? "bg-emerald-500" : overallPct >= 50 ? "bg-emerald-600" : "bg-amber-500"}`}
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Course Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-white border border-slate-200 p-6 h-32" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
          <Target size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-800">No courses enrolled yet</h3>
          <p className="text-xs text-slate-400 mt-1">Enroll in a course to start tracking your progress here.</p>
          <Link
            to="/courses"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95"
          >
            <BookOpen size={15} /> Browse Courses
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {courses.map((course) => {
            const isExpanded = expanded[course.courseId];
            const isDone = course.progressPercent === 100;

            return (
              <div key={course.courseId} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                {/* Course header */}
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    {/* Progress ring */}
                    <div className="relative shrink-0">
                      <ProgressRing percent={course.progressPercent} />
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
                        {course.progressPercent}%
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 leading-snug">{course.title}</h2>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            {course.level && (
                              <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">{course.level}</span>
                            )}
                            {isDone && (
                              <span className="rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-0.5 text-xs font-bold flex items-center gap-1">
                                <CheckCircle size={11} /> Completed
                              </span>
                            )}
                          </div>
                        </div>
                        <Link
                          to={`/learn/${course.courseId}`}
                          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-gray-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition"
                        >
                          <Play size={12} /> {isDone ? "Review" : "Continue"}
                        </Link>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                          <span>{course.completedLessons} of {course.totalLessons} lessons done</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${isDone ? "bg-emerald-500" : course.progressPercent >= 50 ? "bg-blue-500" : "bg-amber-500"}`}
                            style={{ width: `${course.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle modules */}
                  <button
                    onClick={() => toggleExpand(course.courseId)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    {isExpanded ? "Hide" : "Show"} module breakdown ({course.modules?.length || 0} modules)
                  </button>
                </div>

                {/* Module breakdown */}
                {isExpanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-6 py-4 space-y-4">
                    {(course.modules || []).map((mod, mi) => (
                      <div key={mod.id}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                              {mi + 1}
                            </span>
                            <span className="text-sm font-semibold text-gray-700">{mod.title}</span>
                          </div>
                          <span className="text-xs text-gray-400">{mod.completedLessons}/{mod.totalLessons} done</span>
                        </div>
                        <div className="ml-8 space-y-1.5">
                          {(mod.lessons || []).map((lesson) => (
                            <div key={lesson.id} className="flex items-center gap-2.5">
                              {lesson.completed ? (
                                <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                              ) : (
                                <Circle size={14} className="text-gray-300 shrink-0" />
                              )}
                              <span className={`text-xs ${lesson.completed ? "text-gray-700 line-through decoration-emerald-300" : "text-gray-500"}`}>
                                {lesson.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentProgress;
