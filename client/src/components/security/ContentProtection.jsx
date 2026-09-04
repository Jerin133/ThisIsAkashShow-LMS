import React, { useEffect, useState, useCallback } from "react";
import { AlertTriangle } from "lucide-react";

/**
 * ContentProtection
 * Lightweight wrapper that:
 *  - Blocks right-click / copy / cut / drag on protected content
 *  - Shows a toast alert on copy/right-click attempts
 *  - Does NOT show a blackout overlay (that's handled by ProtectedVideoPlayer)
 *  - Does NOT listen to blur or visibilitychange (avoids false positives)
 */
const ContentProtection = ({
  children,
  className = "",
}) => {
  const [alert, setAlert] = useState("");

  const showAlert = useCallback((msg) => {
    setAlert(msg);
    setTimeout(() => setAlert(""), 2200);
  }, []);

  // Block Ctrl+C, Ctrl+U, Ctrl+P, Ctrl+S, F12, DevTools shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      const key = e.key || "";
      const keyCode = e.keyCode || e.which || 0;

      // Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && (key === "c" || key === "C")) {
        e.preventDefault();
        showAlert("Copying course content is restricted.");
        try { navigator.clipboard?.writeText("").catch(() => {}); } catch {}
        return false;
      }

      // Ctrl+U / Ctrl+P / Ctrl+S
      if ((e.ctrlKey || e.metaKey) && (key === "u" || key === "p" || key === "s")) {
        e.preventDefault();
        showAlert("This action is disabled on protected content.");
        return false;
      }

      // F12, Ctrl+Shift+I/J/C (DevTools)
      if (
        key === "F12" || keyCode === 123 ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey &&
          (key === "I" || key === "i" || key === "J" || key === "j" || key === "C" || key === "c"))
      ) {
        e.preventDefault();
        showAlert("Developer tools are disabled on protected content.");
        return false;
      }
    };

    window.addEventListener("keydown", handleKey, true);
    return () => window.removeEventListener("keydown", handleKey, true);
  }, [showAlert]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    showAlert("Right-click is disabled on course materials.");
    return false;
  };

  const handleCopyCut = (e) => {
    e.preventDefault();
    try { navigator.clipboard?.writeText("").catch(() => {}); } catch {}
    showAlert("Copying content is restricted.");
    return false;
  };

  return (
    <div
      onContextMenu={handleContextMenu}
      onCopy={handleCopyCut}
      onCut={handleCopyCut}
      onDragStart={(e) => e.preventDefault()}
      className={`relative select-none ${className}`}
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitTouchCallout: "none",
      }}
    >
      {children}

      {/* Toast Alert */}
      {alert && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] rounded-full bg-red-600 text-white px-5 py-2 text-xs font-semibold shadow-xl flex items-center gap-2 pointer-events-none animate-bounce">
          <AlertTriangle size={14} />
          {alert}
        </div>
      )}
    </div>
  );
};

export default ContentProtection;
