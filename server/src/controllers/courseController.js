const supabase = require("../config/supabase");
const ratingService = require("../services/ratingService");

// 1. Get All Published Courses (Public)
const getAllCourses = async (req, res) => {
  try {
    const { data: courses, error } = await supabase
      .from("courses")
      .select("*, modules(id, lessons(id, duration_seconds))")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    const ratingSummaries = await ratingService.getAllCoursesRatingSummary();

    // Calculate lessons count & total duration & rating analytics for each course
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

      const ratingData = ratingSummaries[course.id] || { averageRating: 0, totalRatings: 0 };

      return {
        ...course,
        totalLessons,
        totalHours: (totalSeconds / 3600).toFixed(1),
        averageRating: Number(ratingData.averageRating) || 0,
        totalRatings: Number(ratingData.totalRatings) || 0,
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

    const ratingAnalytics = await ratingService.getCourseRatingAnalytics(id);

    return res.json({
      success: true,
      data: {
        ...course,
        curriculum,
        ratingAnalytics,
        averageRating: Number(ratingAnalytics.averageRating) || 0,
        totalRatings: Number(ratingAnalytics.totalRatings) || 0,
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

// 5. Submit or Update Course Rating (Student Only)
const rateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.user.id;
    const userName =
      req.user.user_metadata?.full_name ||
      req.user.email?.split("@")[0] ||
      "Student";

    if (!rating || Number(rating) < 1 || Number(rating) > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a number between 1 and 5",
      });
    }

    const updatedAnalytics = await ratingService.addOrUpdateRating(
      id,
      userId,
      userName,
      Number(rating),
      review
    );

    return res.json({
      success: true,
      message: "Rating submitted successfully",
      data: updatedAnalytics,
    });
  } catch (error) {
    console.error("Rate Course Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit rating",
    });
  }
};

// 6. Get Current User's Rating for Course
const getMyCourseRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRating = await ratingService.getUserRatingForCourse(id, userId);

    return res.json({
      success: true,
      data: userRating,
    });
  } catch (error) {
    console.error("Get My Rating Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch user rating",
    });
  }
};

// 7. Get Full Course Ratings & Reviews (Public)
const getCourseRatings = async (req, res) => {
  try {
    const { id } = req.params;
    const analytics = await ratingService.getCourseRatingAnalytics(id);

    return res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error("Get Course Ratings Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch course ratings",
    });
  }
};

// 8. Upload Course Thumbnail (Admin service-role upload to bypass RLS)
const uploadCourseThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

    const file = req.file;
    const fileExt = (file.originalname?.split(".").pop() || "jpg").toLowerCase();
    const fileName = `course-thumb-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

    // Upload using Supabase service-role client (bypasses RLS)
    const { error: uploadErr } = await supabase.storage
      .from("course-thumbnails")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype || "image/jpeg",
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadErr) {
      console.error("Supabase Storage Error:", uploadErr);
      throw uploadErr;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("course-thumbnails").getPublicUrl(fileName);

    return res.json({
      success: true,
      data: {
        url: publicUrl,
        path: fileName,
      },
      message: "Thumbnail uploaded successfully",
    });
  } catch (error) {
    console.error("Thumbnail Upload Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload thumbnail",
    });
  }
};

// 9. Update Course Details (Admin)
const updateCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      short_description,
      description,
      price,
      duration,
      level,
      thumbnail_url,
      is_published,
    } = req.body;

    const updates = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updates.title = title.trim();
    if (short_description !== undefined) updates.short_description = short_description.trim();
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = Number(price) || 0;
    if (duration !== undefined) updates.duration = duration.trim();
    if (level !== undefined) updates.level = level;
    if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url?.trim() || null;
    if (is_published !== undefined) updates.is_published = Boolean(is_published);

    const { data, error } = await supabase
      .from("courses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({
      success: true,
      data,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error("Update Course Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update course",
    });
  }
};

module.exports = {
  getAllCourses,
  getCourseDetails,
  checkCourseAccess,
  getLessonMedia,
  rateCourse,
  getMyCourseRating,
  getCourseRatings,
  uploadCourseThumbnail,
  updateCourseDetails,
};
