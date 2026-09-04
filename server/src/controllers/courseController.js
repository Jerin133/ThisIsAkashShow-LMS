const supabase = require("../config/supabase");

// 1. Get All Published Courses (Public)
const getAllCourses = async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*, modules(id, lessons(id, duration_seconds))")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate lessons count & total duration for each course
    const formattedCourses = (courses || []).map((course) => {
      let totalLessons = 0;
      let totalSeconds = 0;

      if (course.modules) {
        course.modules.forEach((mod) => {
          if (mod.lessons) {
            totalLessons += mod.lessons.length;
            mod.lessons.forEach((l) => {
              totalSeconds += Number(l.duration_seconds) || 0;
            });
          }
        });
      }

      return {
        ...course,
        totalLessons,
        totalHours: (totalSeconds / 3600).toFixed(1),
      };
    });

    return res.json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    console.error("Get All Courses Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch courses",
    });
  }
};

// 2. Get Course Details with Modules & Curriculum (Public / Auth)
const getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (courseError || !course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Fetch modules
    const { data: modules, error: modError } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", id)
      .order("order_index", { ascending: true });

    if (modError) throw modError;

    // Fetch lessons for each module
    const moduleIds = (modules || []).map((m) => m.id);
    let lessons = [];

    if (moduleIds.length > 0) {
      const { data: lessonsData, error: lessError } = await supabase
        .from("lessons")
        .select(
          "id, module_id, title, description, duration_seconds, order_index, is_free, is_published, created_at, video_path, notes_path"
        )
        .in("module_id", moduleIds)
        .order("order_index", { ascending: true });

      if (lessError) throw lessError;
      lessons = lessonsData || [];
    }

    // Map lessons into their respective modules
    const curriculum = (modules || []).map((mod) => ({
      ...mod,
      lessons: lessons
        .filter((l) => l.module_id === mod.id)
        .map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          duration_seconds: l.duration_seconds,
          order_index: l.order_index,
          is_free: l.is_free,
          has_video: Boolean(l.video_path),
          has_notes: Boolean(l.notes_path),
        })),
    }));

    return res.json({
      success: true,
      data: {
        ...course,
        curriculum,
      },
    });
  } catch (error) {
    console.error("Get Course Details Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch course details",
    });
  }
};

// 3. Verify Student Access to a Course (Enrolled or Admin)
const checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === "admin") {
      return res.json({
        success: true,
        hasAccess: true,
        role: "admin",
      });
    }

    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .eq("status", "active")
      .maybeSingle();

    return res.json({
      success: true,
      hasAccess: Boolean(enrollment),
      enrollment: enrollment || null,
    });
  } catch (error) {
    console.error("Check Course Access Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to check access",
    });
  }
};

// 4. Secure Media Provider: Generates Signed Streaming URLs for Videos and Notes
const getLessonMedia = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // Fetch lesson with parent module and course info
    const { data: lesson, error: lessonError } = await supabase
      .from("lessons")
      .select("*, modules(course_id)")
      .eq("id", lessonId)
      .single();

    if (lessonError || !lesson) {
      return res.status(404).json({
        success: false,
        message: "Lesson not found",
      });
    }

    const courseId = lesson.modules?.course_id;

    // Access check: User must be Admin, OR Lesson is Free, OR User is Enrolled
    let authorized = false;

    if (userRole === "admin") {
      authorized = true;
    } else if (lesson.is_free) {
      authorized = true;
    } else if (userId && courseId) {
      const { data: enrollment } = await supabase
        .from("enrollments")
        .select("id")
        .eq("user_id", userId)
        .eq("course_id", courseId)
        .eq("status", "active")
        .maybeSingle();

      if (enrollment) {
        authorized = true;
      }
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: "Access Denied: Please enroll in this course to access this lesson content.",
        isLocked: true,
      });
    }

    let signedVideoUrl = null;
    let signedNotesUrl = null;

    // Generate signed video URL (valid for 2 hours)
    if (lesson.video_path) {
      const { data: videoData, error: videoErr } = await supabase.storage
        .from("course-videos")
        .createSignedUrl(lesson.video_path, 7200); // 2 hours expiry

      if (!videoErr && videoData?.signedUrl) {
        signedVideoUrl = videoData.signedUrl;
      }
    }

    // Generate signed notes URL if attached (valid for 2 hours)
    if (lesson.notes_path) {
      const { data: notesData, error: notesErr } = await supabase.storage
        .from("course-notes")
        .createSignedUrl(lesson.notes_path, 7200);

      if (!notesErr && notesData?.signedUrl) {
        signedNotesUrl = notesData.signedUrl;
      }
    }

    return res.json({
      success: true,
      data: {
        lessonId: lesson.id,
        title: lesson.title,
        description: lesson.description,
        is_free: lesson.is_free,
        notes_content: lesson.notes_content || "",
        videoUrl: signedVideoUrl,
        notesUrl: signedNotesUrl,
        notesFileName: lesson.notes_path ? lesson.notes_path.split("/").pop() : null,
      },
    });
  } catch (error) {
    console.error("Get Lesson Media Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate media stream",
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseDetails,
  checkCourseAccess,
  getLessonMedia,
};
