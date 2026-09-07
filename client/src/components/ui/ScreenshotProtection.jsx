import React from "react";
import useScreenshotProtection from "../../hooks/useScreenshotProtection";

/**
 * ScreenshotProtection Component
 * 
 * Global wrapper that provides anti-capture protection across mobile and desktop:
 * - When mobile screenshot tools / assistants / app switchers activate, content blacks out immediately.
 * - Disables touch callout and text/media drag selection on mobile.
 * - Does NOT add any watermark (clean and unobtrusive to the viewer).
 */
const ScreenshotProtection = ({ children, enabled = true }) => {
  const { isProtected } = useScreenshotProtection({ enabled, blankOnBlur: true });

  return (
    <div className="relative w-full min-h-screen select-none -webkit-touch-callout-none">
      {/* Protected content */}
      <div
        className={`w-full transition-opacity duration-75 ${
          isProtected ? "opacity-0 pointer-events-none select-none filter blur-2xl" : "opacity-100"
        }`}
        style={{
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        }}
      >
        {children}
      </div>

      {/* Blackout curtain: activated during capture attempts, app switcher snapshots, or focus loss */}
      {isProtected && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-[999999] bg-black flex flex-col items-center justify-center p-6 text-center select-none"
        >
          <div className="max-w-sm space-y-2">
            <div className="h-10 w-10 mx-auto rounded-full bg-slate-900 flex items-center justify-center text-slate-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Protected Content
            </p>
            <p className="text-sm font-medium text-slate-200">
              Screen capture is disabled to protect copyrighted course material.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotProtection;
