import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getCourses, getPublicStats } from "../../services/api";
import {
  BookOpen, Clock, Sparkles, ArrowRight, Play,
  Users, TrendingUp, CheckCircle, Star, Zap, Shield,
  Megaphone, BarChart2, Globe, Target, Lightbulb, Award,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import CourseCard from "../../components/public/CourseCard";
import AdBanner from "../../components/public/AdBanner";

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const carouselRef = useRef(null);

  // Real analytics state
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Udemy-style Hero motion slider state
  const [heroSlide, setHeroSlide] = useState(0);
  const [heroHovered, setHeroHovered] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (heroHovered) return;
    const timer = setInterval(() => {
      setHeroSlide((prev) => (prev + 1) % 2);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroHovered]);

  const nextHeroSlide = () => setHeroSlide((prev) => (prev + 1) % 2);
  const prevHeroSlide = () => setHeroSlide((prev) => (prev - 1 + 2) % 2);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) nextHeroSlide();
    else if (diff < -45) prevHeroSlide();
    touchStartX.current = null;
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await getCourses();
        if (res.success) setCourses(res.data || []);
      } catch {
        // silently ignore
      } finally {
        setLoadingCourses(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await getPublicStats();
        if (res.success) setStats(res.data);
      } catch {
        // silently ignore — stats widget will show placeholders
      } finally {
        setLoadingStats(false);
      }
    };

    fetchCourses();
    fetchStats();
  }, []);

  // Build stats cards from real data — no trailing +
  const formatCount = (n) => {
    if (n === null || n === undefined) return "—";
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`;
    return String(n);
  };

  const scrollCarousel = (dir) => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.querySelector(".carousel-card");
    const cardWidth = card ? card.offsetWidth + 28 : 340; // gap-7 = 28px
    carouselRef.current.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  const statsCards = [
    {
      label: "Students Enrolled",
      value: loadingStats ? null : formatCount(stats?.totalStudents),
      icon: Users,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Courses Published",
      value: loadingStats ? null : formatCount(stats?.totalCourses),
      icon: BookOpen,
      color: "text-teal-600 bg-teal-50",
    },
    {
      label: "Active Enrollments",
      value: loadingStats ? null : formatCount(stats?.activeEnrollments),
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Completion Rate",
      value: loadingStats ? null : (stats?.completionRate != null ? `${stats.completionRate}%` : "—"),
      icon: Award,
      color: "text-emerald-700 bg-emerald-100/70",
    },
  ];

  const features = [
    {
      icon: Play,
      title: "HD Secure Video Lectures",
      desc: "Stream crisp video lectures with anti-piracy content protection and dynamic watermarks.",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: BarChart2,
      title: "Data-Driven Marketing",
      desc: "Learn analytics, tracking, and conversion optimization techniques used by top marketers.",
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
      desc: "Every course is organized into clear step-by-step milestones for maximum skill retention.",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: CheckCircle,
      title: "Auto Lesson Completion",
      desc: "Lectures mark automatically when finished and keep your progress in perfect sync.",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: Star,
      title: "Expert Curriculum",
      desc: "Industry-aligned syllabus designed for practical marketing skills and real career advancement.",
      color: "bg-emerald-50 text-emerald-700",
    },
  ];

  const steps = [
    { num: "01", title: "Select a Course", desc: "Discover top digital marketing courses curated for real-world excellence." },
    { num: "02", title: "Instant Enrollment", desc: "Unlock lifetime access with our secure, transparent checkout." },
    { num: "03", title: "Learn at Your Pace", desc: "Stream lectures, study notes, and master lessons without rush." },
    { num: "04", title: "Track Your Mastery", desc: "Follow your learning milestones and track your skill growth." },
  ];

  const categories = [
    { icon: Megaphone, label: "Social Media Marketing" },
    { icon: Globe, label: "SEO & Content Marketing" },
    { icon: Target, label: "Performance Marketing" },
    { icon: BarChart2, label: "Analytics & Insights" },
    { icon: Lightbulb, label: "Brand Strategy" },
    { icon: TrendingUp, label: "Growth Hacking" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── Udemy-Style Hero Motion Banner ── */}
      <section className="bg-slate-100/70 border-b border-slate-200/80 py-4 sm:py-6 px-3 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div
            className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-slate-200/90 shadow-md min-h-[500px] md:h-[460px] lg:h-[480px] group select-none"
            onMouseEnter={() => setHeroHovered(true)}
            onMouseLeave={() => setHeroHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sliding Track */}
            <div
              className="flex transition-transform duration-700 ease-in-out h-full min-h-[500px] md:h-[460px] lg:h-[480px]"
              style={{ transform: `translateX(-${heroSlide * 100}%)` }}
            >
              {/* ── Slide 1: Instructor Image ── */}
              <div className="min-w-full w-full h-full flex-shrink-0 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 flex items-center">
                {/* Ambient glow */}
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 left-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="relative mx-auto w-full max-w-7xl h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:px-16 py-8 md:py-0">
                  {/* Left Floating Card (Udemy Style) */}
                  <div className="z-10 w-full max-w-md lg:max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/30 border border-slate-100">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-700 mb-3 shadow-2xs">
                      <Sparkles size={13} className="text-emerald-600" /> Lead Instructor & Founder
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      Master Digital Marketing with Akash
                    </h1>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      Battle-tested frameworks in SEO, performance ads, paid acquisition, and brand growth — taught directly by Master Akash with real-world case studies.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 sm:px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 transition active:scale-95"
                      >
                        Explore Master's Courses <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Right Visual: Instructor Portrait */}
                  <div className="relative mt-6 md:mt-0 flex items-center justify-center h-[200px] sm:h-[260px] md:h-full md:max-h-[420px] w-full md:w-1/2">
                    <div className="relative h-full flex items-center justify-center">
                      <div className="relative h-[200px] sm:h-[260px] md:h-[390px] aspect-[4/5] rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl shadow-black/60 bg-slate-900">
                        <img
                          src="/images/instructor-hero.jpg"
                          alt="Master Akash - Lead Instructor"
                          className="w-full h-full object-cover object-top filter contrast-105"
                        />
                      </div>
                      {/* Floating verified badge */}
                      <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 hidden sm:flex items-center gap-2.5 rounded-2xl border border-emerald-500/30 bg-slate-900/95 px-3.5 py-2 shadow-xl text-white backdrop-blur-md">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                          <Award size={16} />
                        </div>
                        <div>
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">Lead Master</p>
                          <p className="text-xs font-bold text-white">Akash Show</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Slide 2: Digital Marketing Cartoon Illustration ── */}
              <div className="min-w-full w-full h-full flex-shrink-0 relative overflow-hidden bg-gradient-to-r from-emerald-50/70 via-slate-50 to-teal-50/60 flex items-center">
                {/* Decorative background grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

                <div className="relative mx-auto w-full max-w-7xl h-full flex flex-col md:flex-row items-center justify-between px-6 sm:px-12 md:px-16 py-8 md:py-0">
                  {/* Left Floating Card (Udemy Style) */}
                  <div className="z-10 w-full max-w-md lg:max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-2xl shadow-slate-900/10 border border-slate-100">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-700 mb-3 shadow-2xs">
                      <Megaphone size={13} className="text-emerald-600" /> Career Growth Guaranteed
                    </div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      Jump into learning for less
                    </h2>
                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      If you're new to ThisIsAkashShow, we've got good news: Courses start at unbeatable prices with lifetime access, HD video lectures, notes, and expert guidance.
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Link
                        to="/courses"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 sm:px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/25 transition active:scale-95"
                      >
                        Explore All Courses <ArrowRight size={16} />
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      >
                        Sign Up Free
                      </Link>
                    </div>
                  </div>

                  {/* Right Visual: Cartoon Illustration */}
                  <div className="relative mt-6 md:mt-0 flex items-center justify-center h-[200px] sm:h-[260px] md:h-full md:max-h-[420px] w-full md:w-[54%]">
                    <div className="relative w-full h-full flex items-center justify-center">
                      <div className="relative w-full max-w-lg h-[200px] sm:h-[260px] md:h-[370px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl shadow-emerald-500/10 bg-white p-2">
                        <img
                          src="/images/digital-marketing-cartoon.jpg"
                          alt="Digital Marketing E-Learning"
                          className="w-full h-full object-cover object-center rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Navigation Arrows (Udemy circular buttons) ── */}
            <button
              type="button"
              onClick={prevHeroSlide}
              aria-label="Previous slide"
              className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl border border-slate-200/90 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft size={22} />
            </button>

            <button
              type="button"
              onClick={nextHeroSlide}
              aria-label="Next slide"
              className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-white text-slate-800 shadow-xl border border-slate-200/90 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <ChevronRight size={22} />
            </button>

            {/* ── Slide Dots / Indicators ── */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHeroSlide(0)}
                aria-label="Slide 1: Master Akash"
                className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${heroSlide === 0 ? "w-8 bg-emerald-600 shadow-sm" : "w-2.5 bg-slate-300/80 hover:bg-slate-400"
                  }`}
              />
              <button
                type="button"
                onClick={() => setHeroSlide(1)}
                aria-label="Slide 2: Digital Marketing"
                className={`h-2.5 transition-all duration-300 rounded-full cursor-pointer ${heroSlide === 1 ? "w-8 bg-emerald-600 shadow-sm" : "w-2.5 bg-slate-300/80 hover:bg-slate-400"
                  }`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Real-Time Stats ── */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {statsCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 p-5 shadow-2xs hover:bg-white hover:shadow-sm transition">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} shrink-0 shadow-2xs`}>
                  <Icon size={22} />
                </div>
                <div>
                  {value === null ? (
                    <div className="h-7 w-16 rounded-lg bg-slate-200 animate-pulse mb-1" />
                  ) : (
                    <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                  )}
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Affiliate Ad Banner ── */}
      <section className="bg-slate-100/50 border-b border-slate-200/70 py-5 px-6">
        <div className="mx-auto max-w-7xl">
          <AdBanner className="rounded-2xl" />
        </div>
      </section>

      {/* ── Category Chips ── */}
      <section className="bg-white border-b border-slate-200/70 py-10 px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-5 text-center">Explore Topics</p>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(({ icon: Icon, label }) => (
              <Link
                key={label}
                to={`/courses?search=${encodeURIComponent(label)}`}
                className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs hover:border-emerald-300 hover:text-emerald-700 hover:bg-emerald-50/60 hover:shadow-emerald-100 transition-all duration-200 group"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition">
                  <Icon size={14} />
                </div>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Courses ── */}
      <section className="bg-white border-y border-slate-200/70 py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Curated Catalog</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Trending Courses</h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Left / Right arrow controls */}
              <button
                onClick={() => scrollCarousel(-1)}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition shadow-2xs active:scale-95"
                aria-label="Scroll left"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition shadow-2xs active:scale-95"
                aria-label="Scroll right"
              >
                <ChevronRight size={18} />
              </button>
              <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition">
                View All <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {loadingCourses ? (
            <div className="flex gap-7 overflow-hidden">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0 w-80">
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
            /* Horizontal scroll carousel */
            <div
              ref={carouselRef}
              className="flex gap-7 overflow-x-auto scroll-smooth pb-3"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <style>{`.carousel-scroll::-webkit-scrollbar { display: none; }`}</style>
              {courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  className="carousel-card shrink-0 w-[280px] sm:w-[320px]"
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why ThisIsAkashShow — Features ── */}
      <section className="py-20 px-6 relative overflow-hidden bg-slate-50/50">
        {/* Subtle decorative gradient orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-400/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] bg-teal-400/6 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2.5">Why ThisIsAkashShow</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Built for real marketing success</h2>
            <p className="mt-3.5 text-slate-600 text-sm md:text-base leading-relaxed">
              A dedicated academy built around structured learning pathways, industry secrets, and protected lectures taught by working professionals.
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

      {/* ── How It Works ── */}
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

      {/* ── CTA Banner ── */}
      <section className="px-6 py-16 bg-gradient-to-tr from-slate-950 via-emerald-950 to-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-xs font-semibold text-emerald-200 mb-6">
            <Sparkles size={13} /> Start Your Learning Today
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-white leading-tight">
            Ready to upgrade your marketing skills?
          </h2>
          <p className="mt-4 text-emerald-200 text-base md:text-lg max-w-xl mx-auto">
            Join thousands of ambitious learners mastering digital marketing on ThisIsAkashShow.
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