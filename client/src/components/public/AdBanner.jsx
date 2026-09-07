import { useState, useEffect, useRef } from "react";
import { ExternalLink, ChevronLeft, ChevronRight, Info } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * AdBanner — fetches active affiliate ads and renders them centered
 * at the image's natural size (not stretched). Falls back to a styled
 * "AD" placeholder if no image is set or the image fails to load.
 */
export default function AdBanner({ className = "", maxAds }) {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/ads`)
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data?.length) {
          const list = maxAds ? json.data.slice(0, maxAds) : json.data;
          setAds(list);
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Auto-slide every 5 s
  useEffect(() => {
    if (ads.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % ads.length);
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, [ads.length]);

  const go = (dir) => {
    clearInterval(timerRef.current);
    setCurrent(c => (c + dir + ads.length) % ads.length);
  };

  if (!loaded || ads.length === 0) return null;

  return (
    <div className={`flex flex-col items-center py-4 ${className}`}>
      {/* Slides */}
      <div className="relative flex items-center justify-center gap-10">

        {/* Left Arrow */}
        {ads.length > 1 && (
          <button
            onClick={() => go(-1)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow hover:bg-slate-50 transition"
          >
            <ChevronLeft size={15} />
          </button>
        )}

        {/* Ad Card */}
        {ads.map((a, i) => (
          <div
            key={a.id}
            className={`flex flex-col items-center transition-opacity duration-500 ${
              i === current ? "opacity-100" : "hidden"
            }`}
          >
            {/* Official-style Ad Label Header */}
            <div className="w-full flex items-center justify-between px-1 mb-1.5 text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-slate-300 bg-slate-100/80 text-[10px] font-bold text-slate-700 leading-none">
                  Ad
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-slate-400">
                  Advertisement
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Info size={11} />
                <span>Sponsored</span>
              </div>
            </div>

            <a
              href={a.affiliate_link}
              target="_blank"
              rel="noopener noreferrer sponsored"
              aria-label={a.title || "Advertisement"}
              className="group relative block rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Google Ads-style corner badge */}
              <div className="absolute top-3.5 right-3.5 z-10 flex items-center gap-1 rounded bg-white/95 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shadow border border-slate-200/80 backdrop-blur-xs">
                <span className="font-bold text-slate-800">Ad</span>
                <span className="text-slate-300">·</span>
                <Info size={10} className="text-slate-500" />
              </div>

              {a.image_url ? (
                <>
                  <img
                    src={a.image_url}
                    alt={a.title || "Advertisement"}
                    className="max-h-56 max-w-full rounded-xl object-contain"
                    onError={e => {
                      e.currentTarget.parentElement.querySelector(".ad-placeholder").style.display = "flex";
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {/* Error fallback placeholder */}
                  <div
                    className="ad-placeholder h-40 w-80 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex-col items-center justify-center shadow-inner border border-slate-200"
                    style={{ display: "none" }}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-300 mb-2">
                      <span className="text-lg font-black text-slate-600 tracking-wider">AD</span>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Advertisement</span>
                  </div>
                </>
              ) : (
                /* Default placeholder when no image uploaded */
                <div className="h-40 w-80 rounded-xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center shadow-xs group-hover:shadow-sm transition">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md mb-2">
                    <span className="text-lg font-black text-white tracking-widest">AD</span>
                  </div>
                  <span className="text-xs text-slate-600 font-bold uppercase tracking-wider">Advertisement</span>
                  {a.title && (
                    <span className="mt-1 text-[11px] text-slate-400 max-w-[220px] text-center truncate">{a.title}</span>
                  )}
                </div>
              )}

              {/* Hover CTA overlay / Bottom label */}
              {a.title && a.image_url && (
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="rounded-full bg-slate-900/85 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-white flex items-center gap-1.5 shadow">
                    <ExternalLink size={11} /> {a.title}
                  </span>
                </div>
              )}
            </a>
          </div>
        ))}

        {/* Right Arrow */}
        {ads.length > 1 && (
          <button
            onClick={() => go(1)}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 shadow hover:bg-slate-50 transition"
          >
            <ChevronRight size={15} />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {ads.length > 1 && (
        <div className="mt-4 flex gap-1.5">
          {ads.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                i === current ? "w-5 bg-emerald-500" : "w-1.5 bg-slate-300"
              }`}
              onClick={() => setCurrent(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
