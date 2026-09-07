import { useState, useEffect, useRef } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/**
 * AdBanner — fetches active affiliate ads and renders them as a
 * full-width auto-sliding banner strip with arrow controls.
 *
 * Props:
 *   className  — extra wrapper classes (optional)
 *   maxAds     — max number of ads to show (default: all)
 */
export default function AdBanner({ className = "", maxAds }) {
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/api/ads`)
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

  // Don't render anything if no ads
  if (!loaded || ads.length === 0) return null;

  const ad = ads[current];

  return (
    <div className={`relative w-full overflow-hidden rounded-2xl shadow-lg group ${className}`}>
      {/* Slides */}
      <div className="relative h-28 sm:h-36 md:h-44 bg-slate-900">
        {ads.map((a, i) => (
          <a
            key={a.id}
            href={a.affiliate_link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            aria-label={a.title || "Sponsored"}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={a.image_url}
              alt={a.title || "Ad"}
              className="h-full w-full object-cover"
              onError={e => { e.currentTarget.src = "https://placehold.co/1200x176?text=Ad"; }}
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10 pointer-events-none" />

            {/* Title + CTA */}
            {a.title && (
              <div className="absolute bottom-3 left-4 flex items-center gap-2 pointer-events-none">
                <span className="rounded-full bg-black/60 backdrop-blur-sm px-3 py-1 text-xs font-bold text-white">
                  {a.title}
                </span>
                <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white flex items-center gap-1">
                  <ExternalLink size={10} /> Visit
                </span>
              </div>
            )}
          </a>
        ))}

        {/* Sponsored label */}
        <span className="absolute top-2 right-3 z-20 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white/80 pointer-events-none">
          Sponsored
        </span>

        {/* Arrow Controls (only if multiple ads) */}
        {ads.length > 1 && (
          <>
            <button
              onClick={e => { e.preventDefault(); go(-1); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={e => { e.preventDefault(); go(1); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition hover:bg-black/60"
            >
              <ChevronRight size={16} />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 right-4 z-20 flex gap-1.5 pointer-events-none">
              {ads.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current ? "w-4 bg-white" : "w-1.5 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
