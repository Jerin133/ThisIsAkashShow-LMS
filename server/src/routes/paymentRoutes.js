const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  createOrder,
  verifyPayment,
} = require("../controllers/paymentController");

// Create order requires student to be logged in
router.post("/create-order", authMiddleware, createOrder);

// Verify payment requires authenticated user
router.post("/verify", authMiddleware, verifyPayment);

module.exports = router;
