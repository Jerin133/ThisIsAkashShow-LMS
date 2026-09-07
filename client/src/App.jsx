import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageProgress from "./components/ui/PageProgress";

// Public Pages
import Home from "./pages/public/Home";
import Courses from "./pages/public/Courses";
import CourseDetails from "./pages/public/CourseDetails";
import About from "./pages/public/About";
import Master from "./pages/public/Master";
import Contact from "./pages/public/Contact";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import MyCourses from "./pages/student/MyCourses";
import StudentCoursePlayer from "./pages/student/StudentCoursePlayer";
import StudentProgress from "./pages/student/StudentProgress";
import StudentProfile from "./pages/student/StudentProfile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCourses from "./pages/admin/AdminCourses";
import CreateCourse from "./pages/admin/CreateCourse";
import ManageCourse from "./pages/admin/ManageCourse";
import ManageModule from "./pages/admin/ManageModule";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Routes & Layouts
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";
import PublicLayout from "./layouts/PublicLayout";
import StudentLayout from "./layouts/StudentLayout";
import AdminLayout from "./layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      {/* YouTube-style thin progress bar on every route change */}
      <PageProgress />
      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/courses"
          element={
            <PublicLayout>
              <Courses />
            </PublicLayout>
          }
        />

        <Route
          path="/courses/:courseId"
          element={
            <PublicLayout>
              <CourseDetails />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <About />
            </PublicLayout>
          }
        />

        <Route
          path="/master"
          element={
            <PublicLayout>
              <Master />
            </PublicLayout>
          }
        />

        <Route
          path="/contact"
          element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          }
        />

        {/* ================= AUTH ROUTES ================= */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= DEDICATED STUDENT LEARNING CLASSROOM (Full Screen) ================= */}
        <Route
          path="/learn/:courseId"
          element={
            <ProtectedRoute>
              <StudentCoursePlayer />
            </ProtectedRoute>
          }
        />

        {/* ================= STUDENT PORTAL ROUTES ================= */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="student">
                <StudentLayout>
                  <StudentDashboard />
                </StudentLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/courses"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="student">
                <StudentLayout>
                  <MyCourses />
                </StudentLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/progress"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="student">
                <StudentLayout>
                  <StudentProgress />
                </StudentLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/student/profile"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="student">
                <StudentLayout>
                  <StudentProfile />
                </StudentLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ================= ADMIN PORTAL ROUTES ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <AdminCourses />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses/create"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <CreateCourse />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/courses/:courseId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <ManageCourse />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/modules/:moduleId"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <ManageModule />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <AdminStudents />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <AdminPayments />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRole="admin">
                <AdminLayout>
                  <AdminAnalytics />
                </AdminLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;