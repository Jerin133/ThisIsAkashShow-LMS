import React, { useEffect, useState } from "react";

/**
 * DynamicWatermark Component
 * Renders a dual-layer forensic watermark:
 * 1. A tiled repeating semi-transparent pattern across the container.
 * 2. A slowly drifting/floating security badge with user email, student ID, and live dynamic timestamp.
 */
const DynamicWatermark = ({ user, profile, opacity = 0.16, containerClassName = "" }) => {
  const [position, setPosition] = useState({ top: "25%", left: "30%" });
  const [timestamp, setTimestamp] = useState(new Date().toLocaleTimeString());

  const identifier =
    user?.email ||
    profile?.full_name ||
    (user?.id ? `Student-${user.id.slice(0, 8)}` : "LMS-Secure-Learner");
  const studentId = user?.id ? `ID: ${user.id.slice(0, 8)}` : "";

  // 1. Live Timestamp Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Dynamic drifting movement to prevent static screenshot cropping/masking
  useEffect(() => {
    const moveWatermark = () => {
      const topRandom = Math.floor(Math.random() * 70 + 10); // 10% to 80%
      const leftRandom = Math.floor(Math.random() * 70 + 10); // 10% to 80%
      setPosition({
        top: `${topRandom}%`,
        left: `${leftRandom}%`,
      });
    };

    const interval = setInterval(moveWatermark, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-0 z-30 select-none overflow-hidden ${containerClassName}`}
      aria-hidden="true"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Layer 1: Tiled diagonal watermark matrix */}
      <div
        className="absolute inset-0 flex flex-wrap justify-around items-center opacity-[0.14] -rotate-12 scale-125 pointer-events-none"
      >
        {Array.from({ length: 15 }).map((_, idx) => (
          <div
            key={idx}
            className="p-8 text-center text-xs font-mono font-bold tracking-wider text-emerald-400 mix-blend-difference"
            style={{ textShadow: "0 0 3px rgba(0,0,0,0.8)" }}
          >
            <div>{identifier}</div>
            <div className="text-[10px] opacity-80">{studentId}</div>
          </div>
        ))}
      </div>

      {/* Layer 2: Floating wandering forensic badge */}
      <div
        className="absolute transition-all duration-1000 ease-in-out font-mono font-bold text-xs pointer-events-none"
        style={{
          top: position.top,
          left: position.left,
          opacity: opacity,
          textShadow: "0 0 6px rgba(0,0,0,0.9)",
          transform: "translate(-50%, -50%)",
        }}
      >
        <div className="rounded-lg bg-black/60 px-3.5 py-2 backdrop-blur-xs border border-emerald-500/30 text-white text-center shadow-2xl">
          <div className="text-xs font-bold text-emerald-300">{identifier}</div>
          <div className="text-[10px] text-gray-300 flex items-center justify-center gap-1.5 mt-0.5">
            {studentId && <span>{studentId}</span>}
            <span>• {timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicWatermark;
