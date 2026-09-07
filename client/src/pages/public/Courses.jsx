import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getCourses } from "../../services/api";
import {
  BookOpen, Clock, Sparkles, ArrowRight, Search, X,
  Megaphone, BarChart2, Globe, Target, Lightbulb, TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import CourseCard from "../../components/public/CourseCard";
import AdBanner from "../../components/public/AdBanner";

const LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [activeLevel, setActiveLevel] = useState("All");
  const inputRef = useRef(null);

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

  // Apply search + level filter whenever courses or filter values change
  useEffect(() => {
    let results = [...courses];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      results = results.filter(
        (c) =>
          c.title?.toLowerCase().includes(q) ||
          c.short_description?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.level?.toLowerCase().includes(q)
      );
    }
    if (activeLevel !== "All") {
      results = results.filter(
        (c) => (c.level || "").toLowerCase() === activeLevel.toLowerCase()
      );
    }
    setFiltered(results);
  }, [courses, searchQuery, activeLevel]);

  // Keep URL in sync with search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    } else {
      setSearchParams({});
    }
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const clearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Hero + Search Header */}
      <section className="bg-white border-b border-slate-200/80 px-6 py-16 text-center relative overflow-hidden">
        {/* Ambient background orbs */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute -top-20 left-1/4 w-[400px] h-[400px] bg-emerald-400/8 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-teal-400/8 rounded-full blur-3xl" />
        </div>

        <div className="mx-auto max-w-3xl relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-3.5 py-1 text-xs font-bold text-emerald-700 mb-4 shadow-2xs">
            <Megaphone size={14} className="text-emerald-600" /> Digital Marketing Curriculum
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Explore All Courses
          </h1>
          <p className="mt-3.5 text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
            Practical digital marketing courses covering SEO, social media, paid ads, analytics, and brand strategy.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-8 mx-auto max-w-2xl">
            <div className="flex items-center gap-0 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/60 overflow-hidden focus-within:border-emerald-400 focus-within:shadow-emerald-100/80 transition-all duration-200">
              <div className="flex items-center pl-5 shrink-0 text-slate-400">
                <Search size={19} />
              </div>
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by course name, topic or skill..."
                className="flex-1 py-4 px-4 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="px-3 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={16} />
                </button>
              )}
              <button
                type="submit"
                className="m-1.5 shrink-0 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition active:scale-95"
              >
                Search
              </button>
            </div>
          </form>

          {/* Popular search topics */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium self-center">Popular:</span>
            {["SEO", "Social Media", "Google Ads", "Content Marketing", "Email Marketing", "Analytics"].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSearchQuery(tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  searchQuery === tag
                    ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filters + Catalog */}
      <section className="px-6 py-10 max-w-7xl mx-auto">

        {/* Level Filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mr-2">
            <SlidersHorizontal size={13} /> Filter by level:
          </div>
          {LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => setActiveLevel(level)}
              className={`rounded-xl border px-4 py-1.5 text-xs font-bold transition ${
                activeLevel === level
                  ? "border-emerald-500 bg-emerald-600 text-white shadow-sm shadow-emerald-500/20"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-600"
              }`}
            >
              {level}
            </button>
          ))}
          {(searchQuery || activeLevel !== "All") && (
            <button
              onClick={() => { setSearchQuery(""); setActiveLevel("All"); }}
              className="ml-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-rose-500 hover:border-rose-200 transition"
            >
              <X size={12} /> Clear Filters
            </button>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs text-slate-400 mb-6 font-medium">
            {searchQuery || activeLevel !== "All" ? (
              <>Showing <span className="font-bold text-slate-700">{filtered.length}</span> result{filtered.length !== 1 ? "s" : ""}{searchQuery ? ` for "${searchQuery}"` : ""}</>
            ) : (
              <><span className="font-bold text-slate-700">{filtered.length}</span> courses available</>
            )}
          </p>
        )}

        {loading ? (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
                <div className="h-48 rounded-xl bg-slate-100 mb-4" />
                <div className="h-5 w-3/4 rounded bg-slate-100 mb-2" />
                <div className="h-4 w-1/2 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-10 text-center">
            <p className="text-sm font-semibold text-rose-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-14 text-center shadow-2xs">
            <Search size={40} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No courses found</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-xs mx-auto">
              {searchQuery
                ? `We couldn't find courses matching "${searchQuery}". Try a different keyword.`
                : "No courses match the selected filter. Check back soon!"}
            </p>
            <button
              onClick={() => { setSearchQuery(""); setActiveLevel("All"); }}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              <X size={13} /> Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>

      {/* Affiliate Ad Banner */}
      <section className="bg-slate-50 border-t border-slate-200/70 py-6 px-6">
        <div className="mx-auto max-w-7xl">
          <AdBanner />
        </div>
      </section>
    </div>
  );
};

export default Courses;