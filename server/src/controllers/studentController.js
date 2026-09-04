const supabase = require("../config/supabase");

// 1. Get Enrolled Courses for Authenticated Student with Progress %
const getMyEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("id, course_id, status, enrolled_at, amount, courses(id, title, slug, short_description, price, duration, level, thumbnail_url, modules(id, lessons(id)))")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false });

    if (enrollError) throw enrollError;

    const { data: progressList } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed")
      .eq("user_id", userId)
      .eq("completed", true);

    const completedLessonSet = new Set((progressList || []).map((p) => p.lesson_id));

    const enrolledCourses = (enrollments || []).map((item) => {
      const course = item.courses;
      let totalLessons = 0;
      let completedLessons = 0;

      if (course?.modules) {
        course.modules.forEach((mod) => {
          if (mod.lessons) {
            mod.lessons.forEach((l) => {
              totalLessons++;
              if (completedLessonSet.has(l.id)) completedLessons++;
            });
          }
        });
      }

      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: item.id,
        enrolledAt: item.enrolled_at,
        amount: item.amount,
        courseId: course?.id,
        title: course?.title,
        slug: course?.slug,
        shortDescription: course?.short_description,
        duration: course?.duration,
        level: course?.level,
        thumbnailUrl: course?.thumbnail_url,
        totalLessons,
        completedLessons,
        progressPercent,
      };
    });

    return res.json({ success: true, data: enrolledCourses });
  } catch (error) {
    console.error("Get My Enrolled Courses Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch enrolled courses" });
  }
};

// 2. Mark Lesson Completed or Save Progress
const updateLessonProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lessonId, courseId, completed, lastWatchedSecond } = req.body;

    if (!lessonId || !courseId) {
      return res.status(400).json({ success: false, message: "lessonId and courseId are required" });
    }

    const { data: progress, error } = await supabase
      .from("lesson_progress")
      .upsert(
        {
          user_id: userId,
          course_id: courseId,
          lesson_id: lessonId,
          completed: completed !== undefined ? completed : true,
          last_watched_second: lastWatchedSecond || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" }
      )
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, message: "Lesson progress updated successfully", data: progress });
  } catch (error) {
    console.error("Update Progress Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update progress" });
  }
};

// 3. Get Course Progress for Current Student
const getCourseProgress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId } = req.params;

    const { data: progress, error } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed, last_watched_second")
      .eq("user_id", userId)
      .eq("course_id", courseId);

    if (error) throw error;

    return res.json({ success: true, data: progress || [] });
  } catch (error) {
    console.error("Get Course Progress Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch progress" });
  }
};

// 4. Get Student Profile
const getStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return res.json({ success: true, data: profile });
  } catch (error) {
    console.error("Get Student Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch profile" });
  }
};

// 5. Update Student Profile (full_name)
const updateStudentProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName } = req.body;

    if (!fullName || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: "Full name must be at least 2 characters." });
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, message: "Profile updated successfully", data: profile });
  } catch (error) {
    console.error("Update Student Profile Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update profile" });
  }
};

// 6. Get Full My Progress — all courses with detailed lesson-level breakdown
const getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all active enrollments with full lesson structure
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("id, course_id, enrolled_at, amount, courses(id, title, level, duration, modules(id, title, order_index, lessons(id, title, duration_seconds, order_index)))")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("enrolled_at", { ascending: false });

    if (enrollError) throw enrollError;

    // Get all lesson progress for this user
    const { data: progressData, error: progError } = await supabase
      .from("lesson_progress")
      .select("lesson_id, completed, last_watched_second, updated_at")
      .eq("user_id", userId);

    if (progError) throw progError;

    const progressMap = {};
    (progressData || []).forEach((p) => { progressMap[p.lesson_id] = p; });

    const result = (enrollments || []).map((enroll) => {
      const course = enroll.courses;
      let totalLessons = 0;
      let completedLessons = 0;

      const modulesWithProgress = (course?.modules || [])
        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
        .map((mod) => {
          const lessonsWithProgress = (mod.lessons || [])
            .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
            .map((lesson) => {
              totalLessons++;
              const prog = progressMap[lesson.id];
              const isCompleted = prog?.completed || false;
              if (isCompleted) completedLessons++;
              return {
                id: lesson.id,
                title: lesson.title,
                durationSeconds: lesson.duration_seconds || 0,
                completed: isCompleted,
                lastWatchedSecond: prog?.last_watched_second || 0,
              };
            });

          const modCompleted = lessonsWithProgress.filter((l) => l.completed).length;
          return {
            id: mod.id,
            title: mod.title,
            totalLessons: lessonsWithProgress.length,
            completedLessons: modCompleted,
            lessons: lessonsWithProgress,
          };
        });

      const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

      return {
        enrollmentId: enroll.id,
        enrolledAt: enroll.enrolled_at,
        amount: enroll.amount,
        courseId: course?.id,
        title: course?.title,
        level: course?.level,
        duration: course?.duration,
        totalLessons,
        completedLessons,
        progressPercent,
        modules: modulesWithProgress,
      };
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    console.error("Get My Progress Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch progress" });
  }
};

module.exports = {
  getMyEnrolledCourses,
  updateLessonProgress,
  getCourseProgress,
  getStudentProfile,
  updateStudentProfile,
  getMyProgress,
};
