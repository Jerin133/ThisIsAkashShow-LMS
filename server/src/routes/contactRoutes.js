const express = require("express");
const router = express.Router();
const { submitContactMessage } = require("../controllers/contactController");

// POST /api/contact — Submit a contact message (public, no auth required)
router.post("/", submitContactMessage);

module.exports = router;
