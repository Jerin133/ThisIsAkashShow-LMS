const express = require("express");
const router = express.Router();
const multer = require("multer");
const { authMiddleware, requireAdmin } = require("../middleware/authMiddleware");
const supabase = require("../config/supabase");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

// ── Public: Get all active ads ──────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("affiliate_ads")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Get Ads Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch ads" });
  }
});

// ── Admin: Get ALL ads (including inactive) ─────────────────────────────────
router.get("/all", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("affiliate_ads")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) throw error;

    return res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Get All Ads Error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch ads" });
  }
});

// ── Admin: Create new ad ────────────────────────────────────────────────────
router.post("/", authMiddleware, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, affiliate_link, display_order, is_active } = req.body;
    let image_url = req.body.image_url || null;

    if (!affiliate_link) {
      return res.status(400).json({ success: false, message: "Affiliate link is required" });
    }

    // Upload image to Supabase storage if file was provided
    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `ad_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("ad-images")
        .getPublicUrl(fileName);

      image_url = urlData.publicUrl;
    }

    if (!image_url) {
      return res.status(400).json({ success: false, message: "An ad image is required" });
    }

    const { data, error } = await supabase
      .from("affiliate_ads")
      .insert({
        title: title || null,
        image_url,
        affiliate_link,
        display_order: parseInt(display_order) || 0,
        is_active: is_active !== "false",
      })
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: "Ad created successfully" });
  } catch (error) {
    console.error("Create Ad Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create ad" });
  }
});

// ── Admin: Update ad ────────────────────────────────────────────────────────
router.put("/:id", authMiddleware, requireAdmin, upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, affiliate_link, display_order, is_active, image_url: bodyImageUrl } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (affiliate_link !== undefined) updates.affiliate_link = affiliate_link;
    if (display_order !== undefined) updates.display_order = parseInt(display_order);
    if (is_active !== undefined) updates.is_active = is_active === "true" || is_active === true;

    // Upload new image if provided
    if (req.file) {
      const ext = req.file.originalname.split(".").pop();
      const fileName = `ad_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("ad-images")
        .upload(fileName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("ad-images")
        .getPublicUrl(fileName);

      updates.image_url = urlData.publicUrl;
    } else if (bodyImageUrl) {
      updates.image_url = bodyImageUrl;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("affiliate_ads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return res.json({ success: true, data, message: "Ad updated successfully" });
  } catch (error) {
    console.error("Update Ad Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update ad" });
  }
});

// ── Admin: Delete ad ────────────────────────────────────────────────────────
router.delete("/:id", authMiddleware, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the ad first to get image URL for cleanup
    const { data: ad } = await supabase
      .from("affiliate_ads")
      .select("image_url")
      .eq("id", id)
      .single();

    // Try to delete image from storage (best-effort)
    if (ad?.image_url) {
      try {
        const urlParts = ad.image_url.split("/ad-images/");
        if (urlParts.length > 1) {
          await supabase.storage.from("ad-images").remove([urlParts[1]]);
        }
      } catch (_) {
        // Non-fatal: image cleanup failure doesn't block ad deletion
      }
    }

    const { error } = await supabase
      .from("affiliate_ads")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return res.json({ success: true, message: "Ad deleted successfully" });
  } catch (error) {
    console.error("Delete Ad Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to delete ad" });
  }
});

module.exports = router;
