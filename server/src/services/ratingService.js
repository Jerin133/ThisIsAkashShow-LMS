const supabase = require("../config/supabase");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "../data/ratings.json");

// Helper to read local cache
const readLocalData = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const content = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (err) {
    return [];
  }
};

// Helper to write local cache
const writeLocalData = (data) => {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Local ratings cache write error:", err);
  }
};

// 1. Get rating analytics for a specific course directly from Supabase
const getCourseRatingAnalytics = async (courseId) => {
  try {
    const { data: dbRatings, error } = await supabase
      .from("course_ratings")
      .select("id, course_id, user_id, rating, review, created_at, profiles(full_name, email)")
      .eq("course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Error fetching course_ratings from Supabase, using local cache:", error);
      return getLocalCourseRatingAnalytics(courseId);
    }

    const ratingsList = dbRatings || [];
    const totalRatings = ratingsList.length;
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    if (totalRatings === 0) {
      return {
        averageRating: 0,
        totalRatings: 0,
        distribution,
        reviews: [],
      };
    }

    let sum = 0;
    const reviews = [];

    ratingsList.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      sum += star;
      distribution[star] = (distribution[star] || 0) + 1;

      reviews.push({
        id: r.id,
        courseId: r.course_id,
        userId: r.user_id,
        userName: r.profiles?.full_name || r.profiles?.email?.split("@")[0] || "Student",
        rating: star,
        review: r.review || "",
        createdAt: r.created_at,
      });
    });

    const averageRating = Number((sum / totalRatings).toFixed(1));

    return {
      averageRating,
      totalRatings,
      distribution,
      reviews,
    };
  } catch (err) {
    console.error("getCourseRatingAnalytics error:", err);
    return getLocalCourseRatingAnalytics(courseId);
  }
};

// Local fallback analytics (no mock scores)
const getLocalCourseRatingAnalytics = (courseId) => {
  const ratings = readLocalData().filter((r) => r.courseId === courseId);
  const totalRatings = ratings.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  if (totalRatings === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution,
      reviews: [],
    };
  }

  let sum = 0;
  ratings.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
    sum += star;
    distribution[star] = (distribution[star] || 0) + 1;
  });

  return {
    averageRating: Number((sum / totalRatings).toFixed(1)),
    totalRatings,
    distribution,
    reviews: ratings,
  };
};

// 2. Add or update real rating from a student in Supabase database
const addOrUpdateRating = async (courseId, userId, userName, rating, review) => {
  const validRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
  const cleanReview = (review || "").trim();

  try {
    // Upsert into Supabase course_ratings
    const { data, error } = await supabase
      .from("course_ratings")
      .upsert(
        {
          course_id: courseId,
          user_id: userId,
          rating: validRating,
          review: cleanReview,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "course_id, user_id" }
      )
      .select();

    if (error) {
      console.error("Supabase rating upsert error:", error);
    }
  } catch (err) {
    console.error("Rating upsert exception:", err);
  }

  // Also sync to local cache
  const localList = readLocalData();
  const existingIdx = localList.findIndex(
    (r) => r.courseId === courseId && r.userId === userId
  );

  const ratingItem = {
    id: `rate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    courseId,
    userId,
    userName: userName || "Student",
    rating: validRating,
    review: cleanReview,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    localList[existingIdx] = {
      ...localList[existingIdx],
      ...ratingItem,
      id: localList[existingIdx].id,
    };
  } else {
    localList.push(ratingItem);
  }

  writeLocalData(localList);

  return await getCourseRatingAnalytics(courseId);
};

// 3. Get single user's rating for a course
const getUserRatingForCourse = async (courseId, userId) => {
  try {
    const { data, error } = await supabase
      .from("course_ratings")
      .select("id, course_id, user_id, rating, review, created_at")
      .eq("course_id", courseId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        courseId: data.course_id,
        userId: data.user_id,
        rating: data.rating,
        review: data.review,
        createdAt: data.created_at,
      };
    }
  } catch (err) {
    console.warn("Error getting user rating from Supabase:", err);
  }

  const localList = readLocalData();
  return localList.find((r) => r.courseId === courseId && r.userId === userId) || null;
};

// 4. Get map of all course summaries from Supabase { [courseId]: { averageRating, totalRatings } }
const getAllCoursesRatingSummary = async () => {
  try {
    const { data: allRatings, error } = await supabase
      .from("course_ratings")
      .select("course_id, rating");

    if (error) {
      console.warn("Supabase all course ratings query error, using local data:", error);
      return getLocalAllCoursesRatingSummary();
    }

    const map = {};
    (allRatings || []).forEach((r) => {
      if (!map[r.course_id]) {
        map[r.course_id] = { sum: 0, count: 0 };
      }
      map[r.course_id].sum += Number(r.rating) || 0;
      map[r.course_id].count += 1;
    });

    const summary = {};
    Object.keys(map).forEach((courseId) => {
      const { sum, count } = map[courseId];
      summary[courseId] = {
        averageRating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
        totalRatings: count,
      };
    });

    return summary;
  } catch (err) {
    console.error("getAllCoursesRatingSummary error:", err);
    return getLocalAllCoursesRatingSummary();
  }
};

const getLocalAllCoursesRatingSummary = () => {
  const ratings = readLocalData();
  const map = {};

  ratings.forEach((r) => {
    if (!map[r.courseId]) {
      map[r.courseId] = { sum: 0, count: 0 };
    }
    map[r.courseId].sum += Number(r.rating) || 0;
    map[r.courseId].count += 1;
  });

  const summary = {};
  Object.keys(map).forEach((courseId) => {
    const { sum, count } = map[courseId];
    summary[courseId] = {
      averageRating: count > 0 ? Number((sum / count).toFixed(1)) : 0,
      totalRatings: count,
    };
  });

  return summary;
};

module.exports = {
  getCourseRatingAnalytics,
  addOrUpdateRating,
  getUserRatingForCourse,
  getAllCoursesRatingSummary,
};
