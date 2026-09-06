import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * PageProgress
 * Blank page transition overlay with a simple centered spinner.
 * When navigating between pages, the entire screen is blanked and a simple loading spinner appears at the center.
 */
const PageProgress = () => {
  const location = useLocation();
  const [active, setActive] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timerRef = useRef(null);
  const fadeTimerRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);

    setIsFadingOut(false);
    setActive(true);

    timerRef.current = setTimeout(() => {
      setIsFadingOut(true);
      fadeTimerRef.current = setTimeout(() => {
        setActive(false);
        setIsFadingOut(false);
      }, 150);
    }, 380);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [location.pathname]);

  if (!active) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white flex items-center justify-center transition-opacity duration-150 ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      {/* Simple loading spinner at the center */}
      <div className="flex flex-col items-center justify-center">
        <div className="h-10 w-10 rounded-full border-3 border-slate-200 border-t-emerald-600 animate-spin" />
      </div>
    </div>
  );
};

export default PageProgress;
