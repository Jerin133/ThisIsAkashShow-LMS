const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// POST /api/auth/register
// Bypasses Supabase 429 email rate limit by using admin.createUser with email_confirm: true
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName?.trim() || "Student";

    // Create user via Supabase Admin API with pre-confirmed email (no rate-limited SMTP needed)
    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        role: "student",
      },
    });

    if (createError) {
      if (
        createError.message?.toLowerCase().includes("already registered") ||
        createError.message?.toLowerCase().includes("already been registered") ||
        createError.status === 422
      ) {
        return res.status(400).json({
          success: false,
          message: "An account with this email already exists. Please log in.",
        });
      }
      throw createError;
    }

    // Ensure public profile exists
    if (userData?.user) {
      await supabase.from("profiles").upsert(
        {
          id: userData.user.id,
          email: cleanEmail,
          full_name: cleanName,
          role: "student",
        },
        { onConflict: "id" }
      );
    }

    return res.json({
      success: true,
      data: {
        user: userData?.user,
      },
      message: "Account registered successfully",
    });
  } catch (error) {
    console.error("Auth Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create account",
    });
  }
});

module.exports = router;
