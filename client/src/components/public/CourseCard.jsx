import React from "react";
import { Link } from "react-router-dom";
import { Star, Clock, BookOpen } from "lucide-react";

/**
 * CourseCard — Modeled after the Udemy course card design
 * Shows:
 * - 16:9 course thumbnail (using admin-uploaded thumbnail_url or fallback)
 * - Course Title (2-line clamped bold)
 * - Instructor/Topic subtitle
 * - "Bestseller" badge + Star rating (real analytics) + rating count
 * - Price & Strikethrough original price + "View Course" action button
 */
const CourseCard = ({ course, className = "" }) => {
  if (!course) return null;

  const price = Number(course.price) || 0;
  const originalPrice = Math.round(price * 3.5) || 1999;

  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  const formattedOriginalPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(originalPrice);

  const totalRatings = Number(course.totalRatings) || 0;
  const rating = totalRatings > 0 ? Number(course.averageRating) || 0 : 0;
  const isBestseller = totalRatings >= 2 && rating >= 4.0;

  const fallbackThumbnail = "/images/digital-marketing-cartoon.jpg";
  const thumbnail = course.thumbnail_url || fallbackThumbnail;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 group ${className}`}
    >
      {/* ── Thumbnail at Top (16:9 Aspect Ratio) ── */}
      <Link
        to={`/courses/${course.id}`}
        className="relative aspect-video w-full overflow-hidden bg-slate-100 block border-b border-slate-100"
      >
        <img
          src={thumbnail}
          alt={course.title}
          onError={(e) => {
            if (e.currentTarget.src !== fallbackThumbnail) {
              e.currentTarget.src = fallbackThumbnail;
            }
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Level badge overlay */}
        <span className="absolute top-3 left-3 rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-200/80 shadow-2xs">
          {course.level || "Beginner"}
        </span>

        {course.duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-slate-900/85 text-white backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold shadow-2xs flex items-center gap-1">
            <Clock size={10} className="text-emerald-400" /> {course.duration}
          </span>
        )}
      </Link>

      {/* ── Card Body (Udemy Layout) ── */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title */}
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-slate-900 text-sm sm:text-[15px] leading-snug line-clamp-2 min-h-[2.6rem] group-hover:text-emerald-600 transition-colors">
              {course.title}
            </h3>
          </Link>

          {/* Instructor / Subtitle */}
          <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
            {course.short_description || "ThisIsAkashShow · Master Akash"}
          </p>

          {/* Rating Row (Real Analytics — no mock data) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {isBestseller ? (
              <span className="rounded bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 shrink-0">
                Bestseller
              </span>
            ) : totalRatings === 0 ? (
              <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 shrink-0">
                New
              </span>
            ) : null}

            <div className="flex items-center gap-1">
              {totalRatings > 0 ? (
                <>
                  <span className="font-bold text-xs text-amber-500 flex items-center gap-0.5">
                    <Star size={13} className="fill-amber-400 text-amber-400 inline" />
                    {rating.toFixed(1)}
                  </span>
                  <span className="text-slate-400 text-xs font-normal">
                    ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
                  </span>
                </>
              ) : (
                <span className="text-slate-400 text-xs font-normal flex items-center gap-1">
                  <Star size={12} className="text-slate-300" />
                  Not yet rated (0 ratings)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Price Row + View Course Button ── */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">
              {formattedPrice}
            </span>
            {price > 0 && (
              <span className="line-through text-slate-400 text-xs font-medium">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          <Link
            to={`/courses/${course.id}`}
            className="rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3.5 py-1.5 text-xs font-bold transition-all shadow-2xs active:scale-95 text-center shrink-0"
          >
            View Course
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
