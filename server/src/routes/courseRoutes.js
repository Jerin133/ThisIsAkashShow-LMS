const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getAllCourses,
  getCourseDetails,
  checkCourseAccess,
  getLessonMedia,
} = require("../controllers/courseController");

// Public courses catalog
router.get("/", getAllCourses);

// Public course curriculum & details
router.get("/:id", getCourseDetails);

// Verify user course enrollment status
router.get("/:courseId/access", authMiddleware, checkCourseAccess);

// Generate time-limited signed URL for video/notes stream (Protected)
router.get("/lessons/:lessonId/media", authMiddleware, getLessonMedia);

module.exports = router;
