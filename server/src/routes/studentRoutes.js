const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getMyEnrolledCourses,
  updateLessonProgress,
  getCourseProgress,
  getStudentProfile,
  updateStudentProfile,
  getMyProgress,
} = require("../controllers/studentController");

// Enrolled courses
router.get("/enrolled-courses", authMiddleware, getMyEnrolledCourses);

// Lesson progress
router.post("/progress", authMiddleware, updateLessonProgress);
router.get("/progress/:courseId", authMiddleware, getCourseProgress);

// Full progress breakdown (all courses)
router.get("/my-progress", authMiddleware, getMyProgress);

// Profile
router.get("/profile", authMiddleware, getStudentProfile);
router.put("/profile", authMiddleware, updateStudentProfile);

module.exports = router;
