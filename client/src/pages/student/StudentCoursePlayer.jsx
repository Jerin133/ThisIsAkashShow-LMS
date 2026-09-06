import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getCourseById,
  checkCourseAccess,
  getLessonMedia,
  updateLessonProgress,
  getCourseProgress,
} from "../../services/api";
import ContentProtection from "../../components/security/ContentProtection";
import ProtectedVideoPlayer from "../../components/security/ProtectedVideoPlayer";
import CheckoutModal from "../../components/checkout/CheckoutModal";
import CourseRatingModal from "../../components/student/CourseRatingModal";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  CheckCircle2,
  Lock,
  FileText,
  Download,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  Share2,
  Volume2,
  Maximize,
  Sparkles,
  Menu,
  X,
  AlertCircle,
  Video,
  Star,
} from "lucide-react";

const StudentCoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  // State
  const [course, setCourse] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);
  const [mediaData, setMediaData] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [expandedModules, setExpandedModules] = useState({});

  const [loading, setLoading] = useState(true);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview | notes | resources
  const [showCheckout, setShowCheckout] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Playback speed
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const videoRef = useRef(null);

  // 1. Initial Load: Fetch Course Details, Access Status, and Progress
  useEffect(() => {
    const loadCourseData = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Get course with curriculum
        const courseRes = await getCourseById(courseId);
        if (!courseRes.success || !courseRes.data) {
          throw new Error("Course not found");
        }
        const courseData = courseRes.data;
        setCourse(courseData);

        // Expand all modules by default
        const initialExpanded = {};
        (courseData.curriculum || []).forEach((mod) => {
          initialExpanded[mod.id] = true;
        });
        setExpandedModules(initialExpanded);

        // 2. Check access
        let accessGranted = false;
        if (profile?.role === "admin") {
          accessGranted = true;
        } else if (user) {
          const accessRes = await checkCourseAccess(courseId);
          accessGranted = Boolean(accessRes.hasAccess);
        }
        setHasAccess(accessGranted);

        // 3. Get completed lessons
        if (user) {
          try {
            const progRes = await getCourseProgress(courseId);
            if (progRes.success && Array.isArray(progRes.data)) {
              const compSet = new Set(
                progRes.data.filter((p) => p.completed).map((p) => p.lesson_id)
              );
              setCompletedLessons(compSet);
            }
          } catch (pErr) {
            console.warn("Could not fetch progress:", pErr);
          }
        }

        // 4. Set first available lesson as active
        let firstLesson = null;
        for (const mod of courseData.curriculum || []) {
          if (mod.lessons && mod.lessons.length > 0) {
            firstLesson = mod.lessons[0];
            break;
          }
        }
        if (firstLesson) {
          setActiveLesson(firstLesson);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadCourseData();
    }
  }, [courseId, user, profile]);

  // 2. Fetch Signed Media Stream (Video / Notes) whenever Active Lesson changes
  useEffect(() => {
    const loadLessonMedia = async () => {
      if (!activeLesson) return;

      try {
        setMediaLoading(true);
        // Call backend to generate time-limited signed URLs
        const mediaRes = await getLessonMedia(activeLesson.id);
        if (mediaRes.success) {
          setMediaData(mediaRes.data);
        }
      } catch (err) {
        console.warn("Media stream restriction:", err.response?.data?.message || err.message);
        setMediaData(null);
      } finally {
        setMediaLoading(false);
      }
    };

    loadLessonMedia();
  }, [activeLesson]);

  // Change playback speed
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Toggle Module Accordion
  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId],
    }));
  };

  // Mark Lesson as Completed (only marks, never un-marks via button)
  const handleMarkComplete = async (lessonOverride) => {
    const lesson = lessonOverride || activeLesson;
    if (!lesson || !user) return;

    // Skip if already completed
    if (completedLessons.has(lesson.id)) return;

    // Optimistic UI update
    setCompletedLessons((prev) => {
      const next = new Set(prev);
      next.add(lesson.id);
      return next;
    });

    try {
      await updateLessonProgress({
        lessonId: lesson.id,
        courseId: course.id,
        completed: true,
      });
    } catch (err) {
      console.error("Failed to mark lesson as completed:", err);
    }
  };

  // Called when the video finishes — auto marks complete then advances
  const handleVideoEnded = () => {
    handleMarkComplete(activeLesson);
    handleNextLesson();
  };

  // Navigate to Next Lesson
  const handleNextLesson = () => {
    if (!course?.curriculum || !activeLesson) return;

    const allLessons = [];
    course.curriculum.forEach((mod) => {
      (mod.lessons || []).forEach((l) => allLessons.push(l));
    });

    const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
    if (currentIndex !== -1 && currentIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentIndex + 1];
      setActiveLesson(nextLesson);
    }
  };

  // Calculate Course Progress %
  const calculateTotalProgress = () => {
    if (!course?.curriculum) return 0;
    let total = 0;
    course.curriculum.forEach((mod) => {
      total += mod.lessons?.length || 0;
    });
    if (total === 0) return 0;
    return Math.round((completedLessons.size / total) * 100);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading secure learning player...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-white text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">{error || "Course Not Found"}</h2>
        <p className="mt-2 text-gray-400">Unable to access course learning materials.</p>
        <Link
          to="/courses"
          className="mt-6 rounded-xl bg-white px-6 py-2.5 font-semibold text-black hover:bg-gray-200 transition"
        >
          Back to Courses
        </Link>
      </div>
    );
  }

  const isLessonAccessible = hasAccess || activeLesson?.is_free;
  const isLessonCompleted = activeLesson ? completedLessons.has(activeLesson.id) : false;
  const progressPercent = calculateTotalProgress();

  return (
    <div className="flex h-screen flex-col bg-gray-950 text-white overflow-hidden">
      {/* 1. TOP NAVIGATION BAR */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900/90 px-4 md:px-6 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <Link
            to={profile?.role === "admin" ? "/admin/courses" : "/student/dashboard"}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white transition"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white line-clamp-1">
              {course.title}
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              {activeLesson ? activeLesson.title : "Select a lesson to begin"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          {/* Progress Bar Header */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-32 rounded-full bg-gray-800 h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-emerald-400">
              {progressPercent}% Complete
            </span>
          </div>

          {/* Rate Course Button */}
          {hasAccess && (
            <button
              onClick={() => setShowRatingModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
              title="Rate this course"
            >
              <Star size={13} className="fill-amber-400 text-amber-400" />
              <span>Rate Course</span>
            </button>
          )}

          {!hasAccess && (
            <button
              onClick={() => setShowCheckout(true)}
              className="rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-bold text-black hover:bg-emerald-400 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
            >
              <Sparkles size={14} />
              Unlock Full Course
            </button>
          )}

          {/* Mobile Sidebar Toggle Button */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 text-gray-300 md:hidden hover:bg-gray-800"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* 2. MAIN LEARNING AREA (Video Player + Sidebar) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left / Center: Video and Notes Content */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-gray-950">
          {/* Protected Video Area */}
          <div className="w-full bg-black flex justify-center items-center relative aspect-video max-h-[65vh] border-b border-gray-800">
            {isLessonAccessible ? (
              <ContentProtection className="w-full h-full">
                {mediaLoading ? (
                  <div className="flex aspect-video w-full items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <p className="text-xs text-gray-400">Loading secure video stream...</p>
                    </div>
                  </div>
                ) : mediaData?.videoUrl ? (
                  <ProtectedVideoPlayer
                    videoUrl={mediaData.videoUrl}
                    playbackSpeed={playbackSpeed}
                    onEnded={handleVideoEnded}
                    user={user}
                    profile={profile}
                  />
                ) : (
                  <div className="flex aspect-video w-full flex-col items-center justify-center bg-gray-900 p-8 text-center text-gray-400">
                    <Video size={48} className="text-gray-600 mb-3" />
                    <p className="text-base font-semibold text-gray-300">
                      No video uploaded for this lesson yet
                    </p>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                      The instructor will publish the lecture video shortly. You can still read the notes below.
                    </p>
                  </div>
                )}
              </ContentProtection>
            ) : (
              /* Locked State if student hasn't purchased */
              <div className="flex aspect-video w-full flex-col items-center justify-center bg-gray-900/90 p-8 text-center backdrop-blur-md">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 mb-4 border border-amber-500/30">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-white">This Lesson is Locked</h3>
                <p className="mt-2 max-w-md text-sm text-gray-400">
                  You need to enroll in this course to access this video, lesson notes, and assignments.
                </p>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="mt-6 rounded-xl bg-white px-6 py-3 text-sm font-bold text-black hover:bg-gray-200 transition shadow-lg active:scale-95"
                >
                  Enroll Now — ₹{Number(course.price).toLocaleString("en-IN")}
                </button>
              </div>
            )}
          </div>

          {/* Action Bar Below Video */}
          <div className="border-b border-gray-800 bg-gray-900 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Playback speed selector */}
              {isLessonAccessible && mediaData?.videoUrl && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 rounded-lg p-1">
                  <span className="px-2 font-medium">Speed:</span>
                  {[0.75, 1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-0.5 rounded text-xs font-semibold transition ${
                        playbackSpeed === spd
                          ? "bg-black text-white"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Mark Complete Button */}
              {user && (
                <button
                  onClick={() => handleMarkComplete()}
                  disabled={isLessonCompleted}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                    isLessonCompleted
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 cursor-default"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {isLessonCompleted ? (
                    <>
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      Completed
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Mark Complete
                    </>
                  )}
                </button>
              )}

              {/* Next Lesson Button */}
              <button
                onClick={handleNextLesson}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-gray-200 transition"
              >
                Next Lesson →
              </button>
            </div>
          </div>

          {/* Lesson Details Tabs */}
          <ContentProtection className="flex-1 p-6 max-w-5xl w-full">
            <div className="flex border-b border-gray-800 space-x-6 text-sm font-medium">
              <button
                onClick={() => setActiveTab("overview")}
                className={`pb-3 transition border-b-2 flex items-center gap-2 ${
                  activeTab === "overview"
                    ? "border-emerald-500 text-white font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <BookOpen size={16} />
                Lesson Overview
              </button>

              <button
                onClick={() => setActiveTab("notes")}
                className={`pb-3 transition border-b-2 flex items-center gap-2 ${
                  activeTab === "notes"
                    ? "border-emerald-500 text-white font-semibold"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                <FileText size={16} />
                Study Notes & Materials
              </button>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">
                      {activeLesson?.title || "Lesson Overview"}
                    </h2>
                    {activeLesson?.is_free && (
                      <span className="rounded-full bg-blue-500/20 text-blue-400 px-3 py-1 text-xs font-semibold border border-blue-500/30">
                        Free Preview
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-300 whitespace-pre-line select-none">
                    {activeLesson?.description || "No description provided for this lesson."}
                  </p>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="space-y-6">
                  {isLessonAccessible ? (
                    <>
                      {/* Attached Notes PDF/Document */}
                      {mediaData?.notesUrl ? (
                        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-semibold text-white">
                                {mediaData.notesFileName || "Lesson Notes & Lecture Slides"}
                              </h4>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Official verified study attachment (PDF / Document)
                              </p>
                            </div>
                          </div>
                          <a
                            href={mediaData.notesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-bold text-black hover:bg-emerald-400 transition"
                          >
                            <Download size={15} />
                            Download Notes
                          </a>
                        </div>
                      ) : null}

                      {/* Text Notes Content */}
                      {mediaData?.notes_content ? (
                        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-6 relative overflow-hidden select-none">
                          <h4 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
                            <FileText size={18} className="text-emerald-400" />
                            Lecture Notes & Key Takeaways
                          </h4>
                          <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed whitespace-pre-line select-none">
                            {mediaData.notes_content}
                          </div>
                        </div>
                      ) : null}

                      {!mediaData?.notesUrl && !mediaData?.notes_content && (
                        <div className="rounded-xl border border-dashed border-gray-800 p-8 text-center text-gray-500 text-sm">
                          No supplemental notes have been attached to this lesson yet.
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
                      <Lock size={32} className="mx-auto text-amber-500 mb-3" />
                      <h4 className="text-lg font-bold">Study Notes are Locked</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        Enroll in this course to download the official lecture notes and attachments.
                      </p>
                      <button
                        onClick={() => setShowCheckout(true)}
                        className="mt-4 rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-gray-200"
                      >
                        Enroll to Unlock
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </ContentProtection>
        </div>

        {/* Right: Course Curriculum Playlist Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`fixed inset-y-0 right-0 z-30 w-80 md:w-96 border-l border-gray-800 bg-gray-900 transition-transform duration-300 md:relative md:translate-x-0 ${
            mobileSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          } flex flex-col`}
        >
          <div className="border-b border-gray-800 p-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-white">Course Curriculum</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                {course.curriculum?.length || 0} Modules • {completedLessons.size} Completed
              </p>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:text-white md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {(course.curriculum || []).map((mod, modIdx) => (
              <div
                key={mod.id}
                className="overflow-hidden rounded-xl border border-gray-800/80 bg-gray-950/60"
              >
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="flex w-full items-center justify-between bg-gray-900/80 p-3.5 text-left text-xs font-semibold text-gray-200 hover:bg-gray-800/80 transition"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded bg-gray-800 text-[10px] text-gray-400 font-bold">
                      {modIdx + 1}
                    </span>
                    <span className="line-clamp-1">{mod.title}</span>
                  </div>
                  {expandedModules[mod.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Module Lessons */}
                {expandedModules[mod.id] && (
                  <div className="divide-y divide-gray-800/50">
                    {(mod.lessons || []).map((lesson, lessonIdx) => {
                      const isActive = activeLesson?.id === lesson.id;
                      const isCompleted = completedLessons.has(lesson.id);
                      const isLocked = !hasAccess && !lesson.is_free;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            setActiveLesson(lesson);
                            setMobileSidebarOpen(false);
                          }}
                          className={`flex w-full items-center justify-between p-3 text-left transition text-xs ${
                            isActive
                              ? "bg-emerald-500/10 border-l-2 border-emerald-500 text-white font-medium"
                              : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 flex-1 pr-2">
                            {isCompleted ? (
                              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                            ) : isLocked ? (
                              <Lock size={15} className="text-gray-600 shrink-0" />
                            ) : (
                              <Play
                                size={14}
                                className={isActive ? "text-emerald-400 shrink-0" : "text-gray-500 shrink-0"}
                              />
                            )}
                            <span className="line-clamp-1">
                              {lessonIdx + 1}. {lesson.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {lesson.is_free && (
                              <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-400 border border-blue-500/30">
                                FREE
                              </span>
                            )}
                            {lesson.duration_seconds > 0 && (
                              <span className="text-[11px] text-gray-500">
                                {Math.floor(lesson.duration_seconds / 60)}m
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        course={course}
        user={user}
      />

      {/* Course Rating Modal */}
      <CourseRatingModal
        courseId={courseId}
        courseTitle={course?.title}
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
      />
    </div>
  );
};

export default StudentCoursePlayer;
