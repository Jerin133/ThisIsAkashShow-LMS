import axios from "axios";
import { supabase } from "../lib/supabase";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach Supabase Access Token to outgoing requests
api.interceptors.request.use(async (config) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  } catch (error) {
    console.error("Failed to attach auth token to API request:", error);
  }
  return config;
});

// Course API
export const getCourses = async () => {
  const response = await api.get("/courses");
  return response.data;
};

// Public platform stats (no auth required — for Home page)
export const getPublicStats = async () => {
  const response = await api.get("/courses/public-stats");
  return response.data;
};

export const getCourseById = async (id) => {
  const response = await api.get(`/courses/${id}`);
  return response.data;
};

export const checkCourseAccess = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/access`);
  return response.data;
};

export const getLessonMedia = async (lessonId) => {
  const response = await api.get(`/courses/lessons/${lessonId}/media`);
  return response.data;
};

// Course Rating API
export const rateCourse = async (courseId, { rating, review }) => {
  const response = await api.post(`/courses/${courseId}/rate`, { rating, review });
  return response.data;
};

export const getMyCourseRating = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/my-rating`);
  return response.data;
};

export const getCourseRatings = async (courseId) => {
  const response = await api.get(`/courses/${courseId}/ratings`);
  return response.data;
};

// Payment API
export const createPaymentOrder = async (courseId) => {
  const response = await api.post("/payments/create-order", { courseId });
  return response.data;
};

export const verifyPayment = async (paymentPayload) => {
  const response = await api.post("/payments/verify", paymentPayload);
  return response.data;
};

// Student API
export const getMyEnrolledCourses = async () => {
  const response = await api.get("/student/enrolled-courses");
  return response.data;
};

export const updateLessonProgress = async ({ lessonId, courseId, completed, lastWatchedSecond }) => {
  const response = await api.post("/student/progress", { lessonId, courseId, completed, lastWatchedSecond });
  return response.data;
};

export const getCourseProgress = async (courseId) => {
  const response = await api.get(`/student/progress/${courseId}`);
  return response.data;
};

export const getMyProgress = async () => {
  const response = await api.get("/student/my-progress");
  return response.data;
};

export const getStudentProfile = async () => {
  const response = await api.get("/student/profile");
  return response.data;
};

export const updateStudentProfile = async (data) => {
  const response = await api.put("/student/profile", data);
  return response.data;
};

// Admin API
export const getAdminStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

export const getAdminStudents = async () => {
  const response = await api.get("/admin/students");
  return response.data;
};

export const getAdminPayments = async () => {
  const response = await api.get("/admin/payments");
  return response.data;
};

export const getAdminAnalytics = async () => {
  const response = await api.get("/admin/analytics");
  return response.data;
};

// Course Management API
export const uploadCourseThumbnail = async (file) => {
  const formData = new FormData();
  formData.append("thumbnail", file);
  const response = await api.post("/courses/upload-thumbnail", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const updateCourse = async (courseId, courseData) => {
  const response = await api.put(`/courses/${courseId}`, courseData);
  return response.data;
};

export default api;
