import React, { useEffect, useRef, useState, useCallback } from "react";
import { Lock, Play, Pause, Volume2, VolumeX, Maximize, ShieldAlert } from "lucide-react";

/**
 * ProtectedVideoPlayer
 * Canvas-based video renderer.
 * Blocks ONLY keyboard screenshot shortcuts (PrintScreen, Win+Shift+S, etc.).
 * Does NOT blackout on blur, focus loss, or tab switch — avoids false positives.
 * No watermarks.
 */
const ProtectedVideoPlayer = ({
  videoUrl,
  playbackSpeed = 1,
  onEnded,
  user,
  profile,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const isBlackedOutRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBlackedOut, setIsBlackedOut] = useState(false);

  // Wipe canvas to black instantly
  const wipeCanvasToBlack = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  // Canvas rendering loop — no watermark burn-in
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: false });

    const renderLoop = () => {
      if (!isBlackedOutRef.current && !video.paused && !video.ended && video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setCurrentTime(video.currentTime);
      }
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Playback speed sync
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Screenshot keyboard shortcut detection ONLY
  // Does NOT listen to blur or visibilitychange to avoid false positives
  useEffect(() => {
    const triggerBlackout = () => {
      if (isBlackedOutRef.current) return;
      isBlackedOutRef.current = true;
      setIsBlackedOut(true);
      wipeCanvasToBlack();
      try {
        if (videoRef.current && !videoRef.current.paused) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      } catch {}
      // Clear clipboard
      try {
        navigator.clipboard?.writeText("").catch(() => {});
      } catch {}
    };

    const handleKey = (e) => {
      const key = e.key || "";
      const code = e.code || "";
      const keyCode = e.keyCode || e.which || 0;

      // PrintScreen / Alt+PrintScreen
      if (
        key === "PrintScreen" ||
        code === "PrintScreen" ||
        keyCode === 44 ||
        key === "Snapshot"
      ) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        triggerBlackout();
        return false;
      }

      // Win+Shift+S (Snipping Tool) / macOS Cmd+Shift+3/4/5
      if (
        (e.metaKey || e.ctrlKey) &&
        e.shiftKey &&
        (key === "S" || key === "s" || code === "KeyS" || keyCode === 83 ||
          key === "3" || key === "4" || key === "5")
      ) {
        if (e.cancelable) e.preventDefault();
        e.stopPropagation();
        triggerBlackout();
        return false;
      }
    };

    window.addEventListener("keydown", handleKey, true);
    window.addEventListener("keyup", handleKey, true);

    return () => {
      window.removeEventListener("keydown", handleKey, true);
      window.removeEventListener("keyup", handleKey, true);
    };
  }, [wipeCanvasToBlack]);

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Resume from blackout — clears state then resumes video
  const resumeFromLock = () => {
    isBlackedOutRef.current = false;
    setIsBlackedOut(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 50);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative w-full h-full bg-black flex flex-col justify-center items-center select-none overflow-hidden group"
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Hidden HTML5 Video Source */}
      <video
        ref={videoRef}
        src={videoUrl}
        playsInline
        preload="auto"
        disablePictureInPicture
        controlsList="nodownload nofullscreen noremoteplayback"
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
        className="hidden"
      />

      {/* Canvas Video Surface */}
      <canvas
        ref={canvasRef}
        onClick={togglePlay}
        className={`w-full max-h-[60vh] object-contain cursor-pointer transition-opacity duration-75 ${
          isBlackedOut ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Screenshot Blocked Overlay */}
      {isBlackedOut && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black p-6 text-center text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/20 text-red-500 mb-3 border border-red-500/30">
            <Lock size={28} />
          </div>
          <h3 className="text-lg font-bold">Screenshot Blocked</h3>
          <p className="mt-1 max-w-sm text-xs text-gray-400">
            Screen captures are restricted on this content.
          </p>
          <button
            onClick={resumeFromLock}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-gray-200 transition active:scale-95 shadow-md"
          >
            <ShieldAlert size={16} />
            Resume Video
          </button>
        </div>
      )}

      {/* Video Controls Bar */}
      {!isBlackedOut && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
          {/* Progress Seekbar */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />

          <div className="flex items-center justify-between text-xs text-white">
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-1 hover:text-emerald-400 transition" aria-label="Play/Pause">
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>

              <button onClick={toggleMute} className="p-1 hover:text-emerald-400 transition" aria-label="Mute/Unmute">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>

              <span className="font-mono text-[11px] text-gray-300">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <button onClick={toggleFullscreen} className="p-1 hover:text-emerald-400 transition" aria-label="Fullscreen">
              <Maximize size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedVideoPlayer;
