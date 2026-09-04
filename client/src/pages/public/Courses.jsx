import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../services/api";
import { BookOpen, Clock, Sparkles, ArrowRight, Shield } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        setLoading(true);
        const res = await getCourses();
        if (res.success) {
          setCourses(res.data || []);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load course catalog");
      } finally {
        setLoading(false);
      }
    };

    fetchAllCourses();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Light Clean Hero Section with Visible Trading Chart Background */}
      <section className="bg-white border-b border-slate-200/80 px-6 py-16 text-center relative overflow-hidden">
        {/* Visible Stock Chart Background Image with Light Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/trading-chart-bg.jpg"
            alt="Stock Market Trading Charts"
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/85 to-white" />
        </div>

        <div className="mx-auto max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700 mb-4 shadow-2xs">
            <Sparkles size={14} className="text-emerald-600" /> Stock Trading & Analysis Curriculum
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Explore All Trading Courses
          </h1>
          <p className="mt-3.5 text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Equity analysis, candlestick price action, derivatives trading strategies, and DRM-protected lecture streaming.
          </p>
        </div>
      </section>

      {/* Courses Catalog Grid */}
      <section className="px-6 py-12 max-w-7xl mx-auto">
        {loading ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
              >
                <div className="h-48 rounded-xl bg-slate-100 mb-4" />
                <div className="h-5 w-3/4 rounded bg-slate-100 mb-2" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-2xs">
            <BookOpen size={40} className="mx-auto text-slate-400 mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No published courses available yet</h3>
            <p className="text-xs text-slate-500 mt-1">
              Check back soon as our instructors publish new courses.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const price = Number(course.price) || 0;
              const formattedPrice = new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(price);

              return (
                <div
                  key={course.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 group"
                >
                  {/* Clean Light Thumbnail / Header with 3D Illustration */}
                  <div className="h-48 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 relative overflow-hidden border-b border-slate-100 flex flex-col justify-between p-5">
                    {/* 3D Trading Badge Watermark */}
                    <img
                      src="/images/trading-badge.jpg"
                      alt="Stock Trading Course"
                      className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-2xl opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 pointer-events-none shadow-sm"
                    />

                    <div className="flex justify-between items-center z-10">
                      <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs border border-emerald-100 backdrop-blur-sm">
                        {course.level || "Beginner"}
                      </span>
                      <span className="text-xs text-slate-500 bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-100 flex items-center gap-1.5 font-semibold">
                        <Clock size={13} className="text-emerald-600" /> {course.duration || "Self Paced"}
                      </span>
                    </div>

                    <div className="z-10 max-w-[70%]">
                      <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-extrabold flex items-center gap-1">
                        <Sparkles size={11} /> {course.totalLessons || 0} Lessons • {course.totalHours || 0}h Content
                      </span>
                      <h2 className="mt-1 text-lg font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                        {course.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {course.short_description ||
                        course.description ||
                        "Explore in-depth modules and hands-on lecture content."}
                    </p>

                    <div className="mt-6 border-t border-slate-100 pt-5 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-medium text-slate-400">Lifetime Access</span>
                        <p className="text-xl font-extrabold text-slate-900">{formattedPrice}</p>
                      </div>

                      <Link
                        to={`/courses/${course.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4.5 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 active:scale-95"
                      >
                        View Syllabus <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Courses;