const supabase = require("../config/supabase");

// 1. Get Live Admin Dashboard Metrics & Aggregations
const getAdminStats = async (req, res) => {
  try {
    const { count: studentCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "student");

    const { count: courseCount } = await supabase
      .from("courses")
      .select("*", { count: "exact", head: true });

    const { count: enrollmentCount } = await supabase
      .from("enrollments")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { data: payments } = await supabase
      .from("payments")
      .select("amount, status, created_at")
      .eq("status", "success");

    let totalRevenue = 0;
    if (payments) {
      payments.forEach((p) => { totalRevenue += Number(p.amount) || 0; });
    }

    const { data: recentPayments } = await supabase
      .from("payments")
      .select("id, amount, currency, status, created_at, payment_id, order_id, profiles(full_name, email), courses(title)")
      .order("created_at", { ascending: false })
      .limit(10);

    return res.json({
      success: true,
      data: {
        totalStudents: studentCount || 0,
        totalCourses: courseCount || 0,
        activeEnrollments: enrollmentCount || 0,
        totalRevenue,
        recentPayments: recentPayments || [],
      },
    });
  } catch (error) {
    console.error("Get Admin Stats Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch admin stats" });
  }
};

// 2. Get All Students with Enrollment Count
const getAllStudents = async (req, res) => {
  try {
    const { data: students, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at, enrollments(id, course_id, amount, enrolled_at, courses(title))")
      .eq("role", "student")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const formattedStudents = (students || []).map((s) => ({
      id: s.id,
      fullName: s.full_name,
      email: s.email,
      joinedAt: s.created_at,
      enrolledCount: s.enrollments ? s.enrollments.length : 0,
      enrollments: s.enrollments || [],
    }));

    return res.json({ success: true, data: formattedStudents });
  } catch (error) {
    console.error("Get All Students Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch students list" });
  }
};

// 3. Get All Payments
const getAllPayments = async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from("payments")
      .select("id, user_id, course_id, order_id, payment_id, amount, currency, status, created_at, profiles(full_name, email), courses(title)")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json({ success: true, data: payments || [] });
  } catch (error) {
    console.error("Get All Payments Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch payments" });
  }
};

// 4. Admin Analytics — revenue trends, per-course breakdown, completion stats
const getAdminAnalytics = async (req, res) => {
  try {
    // All successful payments with course info
    const { data: payments, error: payError } = await supabase
      .from("payments")
      .select("amount, status, created_at, course_id, courses(id, title, price)")
      .eq("status", "success")
      .order("created_at", { ascending: true });

    if (payError) throw payError;

    // All active enrollments with course info
    const { data: enrollments, error: enrollError } = await supabase
      .from("enrollments")
      .select("id, course_id, enrolled_at, status, courses(id, title, level)")
      .eq("status", "active");

    if (enrollError) throw enrollError;

    // Lesson progress for completion rate
    const { data: progressData } = await supabase
      .from("lesson_progress")
      .select("completed, course_id");

    // Monthly revenue — last 6 months
    const monthlyRevenue = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      monthlyRevenue[key] = 0;
    }
    (payments || []).forEach((p) => {
      const d = new Date(p.created_at);
      const key = d.toLocaleString("en-IN", { month: "short", year: "2-digit" });
      if (monthlyRevenue[key] !== undefined) {
        monthlyRevenue[key] += Number(p.amount) || 0;
      }
    });

    // Per-course breakdown
    const courseMap = {};
    (enrollments || []).forEach((e) => {
      const id = e.course_id;
      const title = e.courses?.title || "Unknown";
      if (!courseMap[id]) courseMap[id] = { id, title, enrollments: 0, revenue: 0, level: e.courses?.level || "" };
      courseMap[id].enrollments += 1;
    });
    (payments || []).forEach((p) => {
      const id = p.course_id;
      if (courseMap[id]) courseMap[id].revenue += Number(p.amount) || 0;
    });

    const courseBreakdown = Object.values(courseMap).sort((a, b) => b.enrollments - a.enrollments);

    // Overall completion rate
    const totalProgress = (progressData || []).length;
    const completedProgress = (progressData || []).filter((p) => p.completed).length;
    const completionRate = totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0;

    const totalRevenue = (payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    return res.json({
      success: true,
      data: {
        totalRevenue,
        totalEnrollments: (enrollments || []).length,
        completionRate,
        monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
        courseBreakdown,
        topCourse: courseBreakdown[0] || null,
      },
    });
  } catch (error) {
    console.error("Get Admin Analytics Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch analytics" });
  }
};

module.exports = {
  getAdminStats,
  getAllStudents,
  getAllPayments,
  getAdminAnalytics,
};
