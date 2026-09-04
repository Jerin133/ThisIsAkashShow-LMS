import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getCourseById, checkCourseAccess } from "../../services/api";
import CheckoutModal from "../../components/checkout/CheckoutModal";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Play,
  Lock,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
} from "lucide-react";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    const fetchCourseInfo = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await getCourseById(courseId);
        if (!res.success || !res.data) {
          throw new Error("Course not found");
        }
        setCourse(res.data);

        // Expand first module
        if (res.data.curriculum && res.data.curriculum.length > 0) {
          setExpandedModules({ [res.data.curriculum[0].id]: true });
        }

        // Check if user is enrolled
        if (user) {
          if (profile?.role === "admin") {
            setHasAccess(true);
          } else {
            const accessRes = await checkCourseAccess(courseId);
            setHasAccess(Boolean(accessRes.hasAccess));
          }
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseInfo();
    }
  }, [courseId, user, profile]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
          <p className="text-xs text-gray-500 font-medium">Loading course syllabus...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <AlertCircle size={44} className="text-red-500 mb-3" />
        <h2 className="text-2xl font-bold text-gray-900">{error || "Course Not Found"}</h2>
        <p className="mt-1 text-sm text-gray-500">The requested course could not be loaded.</p>
        <Link
          to="/courses"
          className="mt-5 rounded-xl bg-black px-6 py-2.5 text-xs font-semibold text-white"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const price = Number(course.price) || 0;
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Course Hero Banner with Visible Trading Chart Background */}
      <section className="bg-white border-b border-slate-200/80 px-6 py-16 md:py-20 relative overflow-hidden">
        {/* Visible Stock Chart Background Image with Light Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/trading-chart-bg.jpg"
            alt="Stock Market Trading Charts"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/60" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="grid gap-12 lg:grid-cols-3 lg:items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 shadow-2xs">
                  {course.level || "Beginner"}
                </span>
                <span className="text-xs font-medium text-slate-500">• {course.duration || "10 Weeks"}</span>
              </div>

              <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl leading-tight text-slate-900 tracking-tight">
                {course.title}
              </h1>

              <p className="text-base text-slate-600 max-w-2xl leading-relaxed">
                {course.short_description ||
                  "Master practical skills through self-hosted video lectures, comprehensive study notes, and hands-on modules."}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-6 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-600" />
                  <span>{course.curriculum?.length || 0} Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Anti-Piracy DRM Secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Sticky Purchase Sidebar */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Left / Center: Details & Syllabus */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xs">
              <h2 className="text-2xl font-bold text-gray-900">About This Course</h2>
              <div className="mt-4 prose max-w-none text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                {course.description}
              </div>
            </div>

            {/* Course Syllabus */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Syllabus</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    {course.curriculum?.length || 0} Structured Modules • Self-Hosted Videos & PDF Notes
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {(course.curriculum || []).map((mod, index) => (
                  <div
                    key={mod.id}
                    className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
                  >
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm text-gray-900 hover:bg-gray-100 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span>{mod.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 font-normal">
                        <span>{mod.lessons?.length || 0} Lessons</span>
                        {expandedModules[mod.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {expandedModules[mod.id] && (
                      <div className="divide-y divide-gray-100 bg-white border-t border-gray-200">
                        {(mod.lessons || []).map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3.5 px-5 text-xs text-gray-700 hover:bg-gray-50 transition"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.is_free || hasAccess ? (
                                <Play size={14} className="text-emerald-600" />
                              ) : (
                                <Lock size={14} className="text-gray-400" />
                              )}
                              <span className="font-medium">{lesson.title}</span>
                            </div>

                            <div className="flex items-center gap-3">
                              {lesson.has_notes && (
                                <span className="flex items-center gap-1 text-[11px] text-gray-400">
                                  <FileText size={12} /> Notes
                                </span>
                              )}
                              {lesson.is_free && (
                                <Link
                                  to={`/learn/${course.id}`}
                                  className="rounded bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px] font-bold border border-blue-200 hover:bg-blue-100 transition"
                                >
                                  FREE PREVIEW
                                </Link>
                              )}
                              {lesson.duration_seconds > 0 && (
                                <span className="text-gray-400">
                                  {Math.floor(lesson.duration_seconds / 60)} min
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Sticky Enrollment Card */}
          <div>
            <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-6">
              {/* Header Box */}
              <div className="h-44 rounded-2xl bg-gradient-to-br from-emerald-800 via-teal-700 to-slate-900 p-6 text-white flex flex-col justify-between shadow-md shadow-emerald-500/20">
                <span className="w-fit rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold backdrop-blur-sm border border-white/20">
                  Course Enrollment
                </span>
                <div>
                  <p className="text-xs font-semibold text-emerald-200">One-Time Fee</p>
                  <p className="text-3xl font-extrabold tracking-tight">{formattedPrice}</p>
                </div>
              </div>

              {/* Action Button */}
              {hasAccess ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200 shadow-2xs">
                    <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                    <span>You own this course! Full access is active.</span>
                  </div>
                  <Link
                    to={`/learn/${course.id}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95"
                  >
                    <Play size={16} /> Go to Learning Classroom
                  </Link>
                </div>
              ) : (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 transition active:scale-95 shadow-md shadow-emerald-500/25"
                >
                  <Sparkles size={16} /> Enroll Now & Start Learning
                </button>
              )}

              {/* Benefits Checklist */}
              <div className="border-t border-gray-100 pt-5 space-y-3 text-xs text-gray-600">
                <p className="font-semibold text-gray-900">This Course Includes:</p>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>Full lifetime access to all lecture modules</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>Downloadable verified study notes & PDFs</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={14} className="text-emerald-600" />
                  <span>Direct instructor-uploaded high quality videos</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Secure 256-bit encrypted checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        course={course}
        user={user}
      />
    </div>
  );
};

export default CourseDetails;