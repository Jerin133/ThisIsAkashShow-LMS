import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCourses } from "../../services/api";
import {
  BookOpen, Clock, Sparkles, ArrowRight, Play,
  Users, TrendingUp, CheckCircle, Star, Zap, Shield
} from "lucide-react";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses();
        if (res.success) setCourses((res.data || []).slice(0, 3));
      } catch {
        // silently ignore
      } finally {
        setLoadingCourses(false);
      }
    };
    fetchCourses();
  }, []);

  const stats = [
    { label: "Students Enrolled", value: "2,400+", icon: Users, color: "text-emerald-600 bg-emerald-50" },
    { label: "Courses Published", value: "50+", icon: BookOpen, color: "text-teal-600 bg-teal-50" },
    { label: "Hours of Content", value: "800+", icon: Clock, color: "text-blue-600 bg-blue-50" },
    { label: "Completion Rate", value: "94%", icon: TrendingUp, color: "text-emerald-700 bg-emerald-100/70" },
  ];

  const features = [
    {
      icon: Play,
      title: "HD Secure Video Lectures",
      desc: "Stream crisp video lectures with anti-piracy content protection and dynamic watermarks.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: TrendingUp,
      title: "Real-Time Tracking",
      desc: "Monitor lesson completion and review comprehensive curriculum metrics seamlessly.",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: Shield,
      title: "Lifetime Course Access",
      desc: "Enroll once and get permanent unrestricted access to all modules, notes, and attachments.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: Zap,
      title: "Structured Modules",
      desc: "Every course is organized into clear step-by-step milestones for effective retention.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: CheckCircle,
      title: "Auto Lesson Completion",
      desc: "Lectures mark automatically when finished and keep your playlist in sync.",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: Star,
      title: "Expert Curriculum",
      desc: "Industry-aligned syllabus designed for practical skills and career advancement.",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const steps = [
    { num: "01", title: "Select a Course", desc: "Discover top technical courses curated for real-world excellence." },
    { num: "02", title: "Instant Enrollment", desc: "Unlock lifetime access with secure, transparent checkout." },
    { num: "03", title: "Learn at Your Pace", desc: "Stream lectures, study notes, and master lessons without rush." },
    { num: "04", title: "Track Your Mastery", desc: "Follow your learning milestones and track your skill growth." },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── Hero with Visible Stock Candlestick Chart Wallpaper ── */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200/80 pt-14 pb-16 md:pt-24 md:pb-28">
        {/* Visible Stock Chart Background Image with High-Key Light Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/trading-chart-bg.jpg"
            alt="Stock Market Trading Charts"
            className="w-full h-full object-cover object-center opacity-45"
          />
          {/* Light gradient mask to keep text ultra-crisp and readable */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-white/40" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white" />
        </div>

        {/* Ambient Glow Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-teal-500/15 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 left-1/3 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-[11px] font-bold text-emerald-700 mb-5 shadow-2xs">
                <TrendingUp size={13} className="text-emerald-600" /> Professional Trading & Market Academy
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-slate-900 leading-[1.12] tracking-tight">
                Master the Markets.<br />
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
                  Trade with Confidence.
                </span>
              </h1>
              <p className="mt-6 text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                Practical stock market courses, live price action strategies, technical analysis, and structured modules taught by seasoned market analysts.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 transition active:scale-95"
                >
                  Explore Trading Courses <ArrowRight size={16} />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs"
                >
                  Join Academy Free
                </Link>
              </div>

              {/* Trust pill */}
              <div className="mt-8 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
                <div className="flex -space-x-2 shrink-0">
                  {["#10b981", "#059669", "#0d9488", "#16a34a"].map((c, i) => (
                    <div
                      key={i}
                      className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-2xs"
                      style={{ backgroundColor: c }}
                    >
                      {["N", "B", "T", "S"][i]}
                    </div>
                  ))}
                </div>
                <span>Trained over <span className="text-slate-900 font-bold">2,400+ active traders</span></span>
              </div>
            </div>

            {/* Right Hero Visual with 3D Stock Trading Illustration & Floating Badges */}
            <div className="relative flex items-center justify-center">
              {/* Ambient Glow behind image */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-teal-400/20 to-emerald-400/20 blur-2xl opacity-70 pointer-events-none" />

              {/* Main 3D Trading Image Container */}
              <div className="relative z-10 w-full overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-emerald-500/10">
                <img
                  src="/images/trading-hero.jpg"
                  alt="Stock Market Trading Analysis"
                  className="w-full h-auto rounded-2xl object-cover"
                />
              </div>

              {/* Floating Sticker 1 - Top Left: Bull & Profits Badge */}
              <div className="absolute -top-5 -left-6 z-20 hidden sm:flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-white/95 px-4 py-2.5 shadow-xl shadow-slate-200/80 backdrop-blur-md animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-2xs">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600">Bullish Momentum</p>
                  <p className="text-xs font-black text-slate-900">+87.5% Win Ratio</p>
                </div>
              </div>

              {/* Floating Sticker 2 - Bottom Right: Live Candlestick Indicator */}
              <div className="absolute -bottom-5 -right-5 z-20 hidden sm:flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl shadow-slate-200/80 backdrop-blur-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-2xs">
                  <Play size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                    <p className="text-xs font-extrabold text-slate-900">Live Market Breakdowns</p>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500">NSE, BSE & Global Indices</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────── */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 p-5 shadow-2xs hover:bg-white hover:shadow-sm transition">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shrink-0 shadow-2xs`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features with Visible Trading Background ────────────── */}
      <section className="py-20 px-6 relative overflow-hidden bg-slate-50/50">
        {/* Visible Subtle Chart Background Texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-25">
          <img
            src="/images/trading-chart-bg.jpg"
            alt="Stock Market Analysis Background"
            className="w-full h-full object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-50" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2.5">Why ThisIsAkashShow</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Engineered for real market success</h2>
            <p className="mt-3.5 text-slate-600 text-sm md:text-base leading-relaxed">
              A dedicated academy built around structured trading pathways, price-action secrets, and protected lectures.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs hover:shadow-md hover:border-emerald-200/80 transition group">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-5 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ──────────────────────────────── */}
      <section className="bg-white border-y border-slate-200/70 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Curated Catalog</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Featured Courses</h2>
            </div>
            <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition">
              View Catalog <ArrowRight size={15} />
            </Link>
          </div>

          {loadingCourses ? (
            <div className="grid gap-7 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
                  <div className="h-44 bg-slate-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-200" />
                    <div className="h-8 w-full rounded-lg bg-slate-200 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 p-12 text-center">
              <BookOpen size={40} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">Courses coming soon</h3>
              <p className="text-sm text-slate-500 mt-1">Our instructors are publishing new courses. Check back soon!</p>
            </div>
          ) : (
            <div className="grid gap-7 md:grid-cols-3">
              {courses.map((course) => {
                const price = Number(course.price) || 0;
                const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);
                return (
                  <div key={course.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-lg hover:border-emerald-300/80 transition-all duration-300 group">
                    {/* Clean Light Thumbnail / Header with 3D Illustration & floating sticker */}
                    <div className="h-48 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/60 relative overflow-hidden border-b border-slate-100 flex flex-col justify-between p-5">
                      {/* Background 3D Stock Trading Badge Watermark */}
                      <img
                        src="/images/trading-badge.jpg"
                        alt="Trading Strategy Course"
                        className="absolute -right-4 -bottom-4 w-32 h-32 object-cover rounded-2xl opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500 pointer-events-none shadow-sm"
                      />

                      <div className="flex items-center justify-between z-10">
                        <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-emerald-700 shadow-2xs border border-emerald-100 backdrop-blur-sm">
                          {course.level || "Beginner"}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 bg-white/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-slate-100 flex items-center gap-1.5">
                          <Clock size={13} className="text-emerald-600" /> {course.duration || "12 weeks"}
                        </span>
                      </div>

                      <div className="z-10 max-w-[70%]">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-600 font-extrabold flex items-center gap-1">
                          <Sparkles size={11} /> {course.totalLessons || 0} Lessons
                        </span>
                        <h3 className="mt-1 text-lg font-extrabold text-slate-900 leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                        {course.short_description || course.description || "Expert-curated lessons and structured content."}
                      </p>
                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-5">
                        <div>
                          <span className="text-xs font-medium text-slate-400">Lifetime Access</span>
                          <p className="text-xl font-extrabold text-slate-900">{formatted}</p>
                        </div>
                        <Link
                          to={`/courses/${course.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4.5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition active:scale-95"
                        >
                          View Details <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">How It Works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Four easy steps to mastery</h2>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} className="relative text-center">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-1/2 w-full h-px border-t-2 border-dashed border-slate-200" />
                )}
                <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 text-emerald-600 text-base font-extrabold shadow-sm">
                  {num}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-[210px] mx-auto">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="px-6 py-16 bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-emerald-200 mb-6">
            <Sparkles size={13} /> Start Your Learning Today
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to upgrade your skillset?
          </h2>
          <p className="mt-4 text-emerald-200 text-base md:text-lg max-w-xl mx-auto">
            Join thousands of ambitious traders mastering the financial markets on ThisIsAkashShow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5 justify-center">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-emerald-950 hover:bg-slate-100 transition shadow-lg active:scale-95"
            >
              Browse Catalog <ArrowRight size={16} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3.5 text-sm font-bold text-white hover:bg-white/15 transition backdrop-blur-sm"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;