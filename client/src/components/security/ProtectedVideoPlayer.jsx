import React, { useEffect, useRef, useState, useCallback } from "react";
import { Lock, Play, Pause, Volume2, VolumeX, Maximize, ShieldAlert } from "lucide-react";

/**
 * ProtectedVideoPlayer
 * High-performance canvas-based video renderer with YouTube-style hover controls.
 * - Controls and seek bar fade out on mouse idle (2.5s) while playing.
 * - Controls immediately hide on mouse leave (when playing).
 * - Mouse movement or hover instantly reveals controls and seek bar.
 * - YouTube-style seek bar: sleek line that subtly expands on hover with pop-in thumb.
 * - Cursor auto-hides when video is playing and controls are idle.
 * - Click canvas to toggle play/pause with animated center icon feedback.
 * - Touch-friendly: tapping screen on mobile toggles / displays controls.
 * - Full screenshot & screen-capture blocking remains active.
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
  const hideTimerRef = useRef(null);
  const isScrubbingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const isTouchDeviceRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBlackedOut, setIsBlackedOut] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [centerIcon, setCenterIcon] = useState(null);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    isScrubbingRef.current = isScrubbing;
  }, [isScrubbing]);

  // Flash animated center play/pause indicator like YouTube
  const triggerCenterIcon = useCallback((type) => {
    setCenterIcon({ type, id: Date.now() });
    setTimeout(() => {
      setCenterIcon(null);
    }, 500);
  }, []);

  // Clear hide timer helper
  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  // Start auto-hide timer (only hides if playing and not scrubbing)
  const startHideTimer = useCallback((delay = 2500) => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => {
      if (isPlayingRef.current && !isScrubbingRef.current) {
        setControlsVisible(false);
      }
    }, delay);
  }, [clearHideTimer]);

  // Show controls and restart timer
  const showControls = useCallback((delay = 2500) => {
    setControlsVisible(true);
    if (isPlayingRef.current && !isScrubbingRef.current) {
      startHideTimer(delay);
    }
  }, [startHideTimer]);

  // Mouse move over player container -> reveal controls
  const handleMouseMove = useCallback(() => {
    showControls(2500);
  }, [showControls]);

  // Mouse leaves player container -> immediately hide controls if playing
  const handleMouseLeave = useCallback(() => {
    if (isPlayingRef.current && !isScrubbingRef.current) {
      clearHideTimer();
      setControlsVisible(false);
      setIsHoveringSeek(false);
    }
  }, [clearHideTimer]);

  // Touch on container
  const handleTouchStart = useCallback(() => {
    isTouchDeviceRef.current = true;
    showControls(3500);
  }, [showControls]);

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

  // Canvas rendering loop
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
          isPlayingRef.current = false;
        }
      } catch {}
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
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().then(() => {
        setIsPlaying(true);
        isPlayingRef.current = true;
        setControlsVisible(true);
        startHideTimer(2500);
        triggerCenterIcon("play");
      }).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      isPlayingRef.current = false;
      clearHideTimer();
      setControlsVisible(true); // Keep controls visible when paused
      triggerCenterIcon("pause");
    }
  }, [startHideTimer, clearHideTimer, triggerCenterIcon]);

  // Canvas click handler (supports touch waking up controls without pausing)
  const handleCanvasClick = useCallback(() => {
    if (isTouchDeviceRef.current) {
      isTouchDeviceRef.current = false;
      if (!controlsVisible) {
        showControls(3500);
        return;
      }
    }
    togglePlay();
  }, [controlsVisible, showControls, togglePlay]);

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
    showControls(2500);
  };

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
    showControls(2500);
  }, [isMuted, showControls]);

  const toggleFullscreen = useCallback(() => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }
  }, []);

  // Keyboard shortcuts (YouTube style)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (isBlackedOutRef.current) return;

      if (e.key === " " || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) {
          const newTime = Math.max(0, videoRef.current.currentTime - 5);
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          showControls(2500);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) {
          const newTime = Math.min(duration || 100, videoRef.current.currentTime + 5);
          videoRef.current.currentTime = newTime;
          setCurrentTime(newTime);
          showControls(2500);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, duration, showControls]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  // Resume from blackout — clears state then resumes video
  const resumeFromLock = () => {
    isBlackedOutRef.current = false;
    setIsBlackedOut(false);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.play().then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          startHideTimer(2500);
        }).catch(() => {});
      }
    }, 50);
  };

  const formatTime = (secs) => {
    if (!secs || isNaN(secs) || secs < 0) return "0:00";
    const totalSecs = Math.floor(secs);
    const hrs = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    const formattedSeconds = s < 10 ? `0${s}` : `${s}`;
    if (hrs > 0) {
      const formattedMinutes = m < 10 ? `0${m}` : `${m}`;
      return `${hrs}:${formattedMinutes}:${formattedSeconds}`;
    }
    return `${m}:${formattedSeconds}`;
  };

  // Progress percentage for seek bar styling
  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      className={`group relative w-full h-full bg-black flex flex-col justify-center items-center select-none overflow-hidden ${
        isPlaying && !controlsVisible ? "cursor-none" : "cursor-default"
      }`}
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
          isPlayingRef.current = false;
          setControlsVisible(true);
          if (onEnded) onEnded();
        }}
        className="hidden"
      />

      {/* Canvas Video Surface */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onDoubleClick={toggleFullscreen}
        className={`w-full max-h-[60vh] object-contain cursor-pointer transition-opacity duration-75 ${
          isBlackedOut ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Center Play/Pause Flash Indicator (YouTube style) */}
      {centerIcon && (
        <div className="absolute pointer-events-none z-20 flex h-16 w-16 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm shadow-xl transition-all duration-300 animate-pulse">
          {centerIcon.type === "play" ? (
            <Play size={28} className="fill-white translate-x-0.5" />
          ) : (
            <Pause size={28} className="fill-white" />
          )}
        </div>
      )}

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

      {/* ── YouTube-Style Bottom Controls Bar (Fades in on Hover, Auto-Hides on Idle) ── */}
      {!isBlackedOut && (
        <div
          className={`absolute bottom-0 inset-x-0 z-30 transition-all duration-300 ease-out ${
            controlsVisible
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-1 pointer-events-none"
          }`}
        >
          {/* Subtle Dark Gradient Backdrop */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 to-transparent pointer-events-none" />

          <div className="relative px-3 pb-3 pt-8 md:px-4 md:pb-4 space-y-1.5">

            {/* ── YouTube-Style Sleek Seek Bar ── */}
            <div
              className="group/seek relative w-full flex items-center py-2 cursor-pointer"
              onMouseEnter={() => setIsHoveringSeek(true)}
              onMouseLeave={() => setIsHoveringSeek(false)}
            >
              {/* Background Track (expands slightly on hover) */}
              <div className="relative w-full h-1 group-hover/seek:h-1.5 transition-all duration-150 rounded-full bg-white/25 overflow-hidden">
                {/* Emerald Progress Fill */}
                <div
                  className="absolute left-0 top-0 h-full bg-emerald-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Scrubber Thumb (Pops in on hover or when dragging) */}
              <div
                className={`absolute pointer-events-none w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-lg shadow-black/70 transition-transform duration-150 ${
                  isHoveringSeek || isScrubbing ? "scale-100" : "scale-0"
                }`}
                style={{
                  left: `calc(${progressPct}% - 7px)`,
                  top: "50%",
                  marginTop: "-7px",
                }}
              />

              {/* Invisible Native Range for Smooth Scrubbing & Mobile Touch Area */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                onMouseDown={() => {
                  setIsScrubbing(true);
                  clearHideTimer();
                }}
                onMouseUp={() => {
                  setIsScrubbing(false);
                  if (isPlayingRef.current) startHideTimer(2500);
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                  setIsScrubbing(true);
                  clearHideTimer();
                }}
                onTouchEnd={(e) => {
                  e.stopPropagation();
                  setIsScrubbing(false);
                  if (isPlayingRef.current) startHideTimer(3500);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                aria-label="Seek video"
              />
            </div>

            {/* ── Control Buttons ── */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-1">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/15 active:bg-white/25 transition"
                  aria-label={isPlaying ? "Pause" : "Play"}
                  title={isPlaying ? "Pause (k/space)" : "Play (k/space)"}
                >
                  {isPlaying ? (
                    <Pause size={20} className="fill-white" />
                  ) : (
                    <Play size={20} className="fill-white ml-0.5" />
                  )}
                </button>

                {/* Mute / Unmute */}
                <button
                  onClick={toggleMute}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/15 active:bg-white/25 transition"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                  title={isMuted ? "Unmute (m)" : "Mute (m)"}
                >
                  {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </button>

                {/* Timestamp */}
                <span className="font-mono text-[11px] md:text-xs text-gray-300 ml-2 select-none">
                  {formatTime(currentTime)}&nbsp;/&nbsp;{formatTime(duration)}
                </span>
              </div>

              {/* Right Controls: Fullscreen */}
              <div className="flex items-center gap-1">
                <button
                  onClick={toggleFullscreen}
                  className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/15 active:bg-white/25 transition"
                  aria-label="Fullscreen"
                  title="Fullscreen (f)"
                >
                  <Maximize size={17} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedVideoPlayer;
