const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getAllCourses,
  getCourseDetails,
  checkCourseAccess,
  getLessonMedia,
  rateCourse,
  getMyCourseRating,
  getCourseRatings,
  uploadCourseThumbnail,
  updateCourseDetails,
} = require("../controllers/courseController");
const supabase = require("../config/supabase");

// Multer memory storage for thumbnail upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// Admin upload thumbnail
router.post("/upload-thumbnail", upload.single("thumbnail"), uploadCourseThumbnail);

// Admin update course
router.put("/:id", authMiddleware, updateCourseDetails);

// Public courses catalog
router.get("/", getAllCourses);

// ── Public Platform Stats (no auth required) ──────────────────────────────
// Returns real aggregated numbers for the Home page stats section.
router.get("/public-stats", async (req, res) => {
  try {
    const [studentsRes, coursesRes, enrollmentsRes, progressRes] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "student"),
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true),
      supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("lesson_progress").select("completed"),
    ]);

    const totalProgress = (progressRes.data || []).length;
    const completedProgress = (progressRes.data || []).filter((p) => p.completed).length;
    const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

    // Estimate total content hours: sum totalHours from all published courses
    const { data: courseHours } = await supabase
      .from("courses")
      .select("total_hours")
      .eq("is_published", true);

    const totalHours = (courseHours || []).reduce((sum, c) => sum + (Number(c.total_hours) || 0), 0);

    return res.json({
      success: true,
      data: {
        totalStudents: studentsRes.count || 0,
        totalCourses: coursesRes.count || 0,
        activeEnrollments: enrollmentsRes.count || 0,
        completionRate,
        totalHours,
      },
    });
  } catch (error) {
    console.error("Public Stats Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
});

// Ratings & Reviews Analytics
router.get("/:id/ratings", getCourseRatings);
router.post("/:id/rate", authMiddleware, rateCourse);
router.get("/:id/my-rating", authMiddleware, getMyCourseRating);

// Public course curriculum & details
router.get("/:id", getCourseDetails);

// Verify user course enrollment status
router.get("/:courseId/access", authMiddleware, checkCourseAccess);

// Generate time-limited signed URL for video/notes stream (Protected)
router.get("/lessons/:lessonId/media", authMiddleware, getLessonMedia);

module.exports = router;
