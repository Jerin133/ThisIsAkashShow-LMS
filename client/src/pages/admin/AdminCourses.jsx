import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { Plus, Pencil, Eye, EyeOff, Globe, CheckCircle, AlertCircle } from "lucide-react";

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [togglingCourseId, setTogglingCourseId] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw error;
      }

      setCourses(data || []);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleTogglePublish = async (course) => {
    try {
      setTogglingCourseId(course.id);
      setError("");
      setSuccessMessage("");

      const newStatus = !course.is_published;

      const { error } = await supabase
        .from("courses")
        .update({
          is_published: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", course.id);

      if (error) throw error;

      setCourses((prev) =>
        prev.map((c) => (c.id === course.id ? { ...c, is_published: newStatus } : c))
      );

      setSuccessMessage(
        newStatus
          ? `"${course.title}" is now published and live on the student catalog!`
          : `"${course.title}" set to Draft.`
      );
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update course publish state.");
    } finally {
      setTogglingCourseId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">Courses Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, publish, and organize academy courses for your learners.
          </p>
        </div>

        <Link
          to="/admin/courses/create"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95"
        >
          <Plus size={16} /> Create New Course
        </Link>
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle size={18} className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading & List */}
      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400">
          Loading courses...
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <h2 className="text-lg font-bold text-gray-800">No courses created yet</h2>
          <p className="mt-1 text-xs text-gray-500">
            Create your first course to get started.
          </p>
          <Link
            to="/admin/courses/create"
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-black px-5 py-2.5 text-xs font-bold text-white"
          >
            <Plus size={16} /> Create Course
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Level</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Status & Visibility</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <Link
                          to={`/admin/courses/${course.id}`}
                          className="font-bold text-gray-900 hover:underline"
                        >
                          {course.title}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {course.duration || "Self-Paced"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-gray-700">
                      {course.level || "Beginner"}
                    </td>

                    <td className="px-6 py-4 font-bold text-gray-900">
                      ₹{Number(course.price).toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleTogglePublish(course)}
                        disabled={togglingCourseId === course.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                          course.is_published
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                        title="Click to toggle publish status"
                      >
                        {togglingCourseId === course.id ? (
                          "Updating..."
                        ) : course.is_published ? (
                          <>
                            <Globe size={13} /> Published (Click to Unpublish)
                          </>
                        ) : (
                          <>
                            <EyeOff size={13} /> Draft (Click to Publish)
                          </>
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <Link
                        to={`/admin/courses/${course.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-black transition"
                      >
                        <Pencil size={13} /> Manage Curriculum
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;