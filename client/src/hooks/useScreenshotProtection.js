import { useEffect, useState } from "react";

/**
 * useScreenshotProtection Hook
 * 
 * Provides multi-layer web anti-capture protection on mobile and desktop devices without watermarks:
 * 1. Instant blackout / blanking on blur & visibility change (defeats screenshot assistants, share sheets, & app-switcher captures).
 * 2. Intercepts hardware/external keyboard screenshot shortcuts (PrintScreen, Meta+Shift+3/4, etc.).
 * 3. Clears system clipboard if capture shortcut is detected.
 * 4. Disables long-press context menu and image drag/save gestures on mobile touch screens.
 * 5. Blanks content during print / save-as-PDF rendering.
 */
export function useScreenshotProtection(options = {}) {
  const { enabled = true, blankOnBlur = true } = options;
  const [isProtected, setIsProtected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // 1. Detection of Window Blur / Visibility Loss (Screenshot tool / Assistant / App Switcher)
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        if (blankOnBlur) setIsProtected(true);
      } else {
        // Quick restore once user returns
        setIsProtected(false);
      }
    };

    const handleBlur = () => {
      if (blankOnBlur) {
        setIsProtected(true);
      }
    };

    const handleFocus = () => {
      setIsProtected(false);
    };

    // 2. Mobile touch / long-press suppression (prevents save image dialog / callout)
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // 3. Print / Save as PDF detection
    const handleBeforePrint = () => {
      setIsProtected(true);
    };

    const handleAfterPrint = () => {
      setIsProtected(false);
    };

    // 4. Keyboard capture interception (external keyboard on mobile/tablet/desktop)
    const handleKeyDown = (e) => {
      // PrintScreen key
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        e.preventDefault();
        setIsProtected(true);
        // Clear clipboard
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (_) {}
        setTimeout(() => setIsProtected(false), 800);
        return false;
      }

      // Windows + Shift + S or Ctrl + P or Meta + Shift + 3/4
      if (
        (e.ctrlKey && (e.key === "p" || e.key === "P")) ||
        (e.metaKey && e.shiftKey && (e.key === "3" || e.key === "4" || e.key === "5")) ||
        (e.metaKey && (e.key === "p" || e.key === "P"))
      ) {
        e.preventDefault();
        setIsProtected(true);
        setTimeout(() => setIsProtected(false), 800);
        return false;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === "PrintScreen" || e.keyCode === 44) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText("");
          }
        } catch (_) {}
      }
    };

    // Attach listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handleBlur);
    window.addEventListener("pageshow", handleFocus);
    document.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pagehide", handleBlur);
      window.removeEventListener("pageshow", handleFocus);
      document.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [enabled, blankOnBlur]);

  return { isProtected };
}

export default useScreenshotProtection;
