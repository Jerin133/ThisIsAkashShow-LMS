const express = require("express");
const router = express.Router();
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const {
  getAdminStats,
  getAllStudents,
  getAllPayments,
  getAdminAnalytics,
} = require("../controllers/adminController");

// All admin routes require authentication + admin role
router.use(authMiddleware, requireAdmin);

router.get("/stats", getAdminStats);
router.get("/students", getAllStudents);
router.get("/payments", getAllPayments);
router.get("/analytics", getAdminAnalytics);

module.exports = router;
