import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Globe,
  Lock,
} from "lucide-react";

const ManageCourse = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  const [loading, setLoading] = useState(true);
  const [moduleLoading, setModuleLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [moduleError, setModuleError] = useState("");

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [showEditCourseModal, setShowEditCourseModal] = useState(false);

  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
  });

  const [courseForm, setCourseForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "",
    duration: "",
    level: "Beginner",
  });

  const fetchCourse = async () => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) {
      throw error;
    }

    setCourse(data);
    setCourseForm({
      title: data.title || "",
      shortDescription: data.short_description || "",
      description: data.description || "",
      price: data.price || "",
      duration: data.duration || "",
      level: data.level || "Beginner",
    });
  };

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    setModules(data || []);
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");

      await fetchCourse();
      await fetchModules();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [courseId]);

  // Toggle Course Published / Draft Status
  const handleTogglePublish = async () => {
    try {
      setPublishLoading(true);
      setError("");
      setSuccessMessage("");

      const newPublishedState = !course.is_published;

      const { data, error } = await supabase
        .from("courses")
        .update({
          is_published: newPublishedState,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId)
        .select()
        .single();

      if (error) throw error;

      setCourse(data);
      setSuccessMessage(
        newPublishedState
          ? "Course published successfully! It is now visible to students on the catalog."
          : "Course changed to Draft. It is now hidden from the public catalog."
      );
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update course publish status.");
    } finally {
      setPublishLoading(false);
    }
  };

  // Update Course Details
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    try {
      setPublishLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("courses")
        .update({
          title: courseForm.title.trim(),
          short_description: courseForm.shortDescription.trim(),
          description: courseForm.description.trim(),
          price: Number(courseForm.price) || 0,
          duration: courseForm.duration.trim(),
          level: courseForm.level,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId)
        .select()
        .single();

      if (error) throw error;

      setCourse(data);
      setShowEditCourseModal(false);
      setSuccessMessage("Course details updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update course.");
    } finally {
      setPublishLoading(false);
    }
  };

  const handleModuleChange = (e) => {
    setModuleForm({
      ...moduleForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    setModuleError("");

    if (!moduleForm.title.trim()) {
      setModuleError("Module title is required.");
      return;
    }

    try {
      setModuleLoading(true);

      const nextOrder =
        modules.length > 0
          ? Math.max(...modules.map((module) => module.order_index)) + 1
          : 1;

      const { error } = await supabase.from("modules").insert({
        course_id: courseId,
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim(),
        order_index: nextOrder,
      });

      if (error) throw error;

      setModuleForm({
        title: "",
        description: "",
      });

      setShowModuleForm(false);
      await fetchModules();
    } catch (error) {
      console.error(error);
      setModuleError(error.message);
    } finally {
      setModuleLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this module? All lessons inside will be deleted."
    );

    if (!confirmed) return;

    try {
      const { error } = await supabase.from("modules").delete().eq("id", moduleId);
      if (error) throw error;
      await fetchModules();
    } catch (error) {
      console.error(error);
      setModuleError(error.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading course...</div>;
  }

  if (error && !course) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Course not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/admin/courses"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
          >
            <ArrowLeft size={16} /> Back to Courses
          </Link>

          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
            Course Management
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900">{course.title}</h1>

          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            {course.short_description || "No short description available."}
          </p>
        </div>

        {/* Action Controls: Publish / Draft Toggle & Edit */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowEditCourseModal(true)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-xs"
          >
            <Pencil size={14} /> Edit Details
          </button>

          <button
            onClick={handleTogglePublish}
            disabled={publishLoading}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm ${
              course.is_published
                ? "bg-amber-600 hover:bg-amber-700 text-white"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            } disabled:opacity-50`}
          >
            {publishLoading ? (
              "Updating..."
            ) : course.is_published ? (
              <>
                <EyeOff size={15} /> Unpublish (Set to Draft)
              </>
            ) : (
              <>
                <Globe size={15} /> Publish Course Now
              </>
            )}
          </button>
        </div>
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

      {/* Course Information Card */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Course Information</h2>
              <p className="text-xs text-gray-500">Overview & pricing details</p>
            </div>
          </div>

          <div>
            {course.is_published ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold text-emerald-700">
                <Globe size={13} /> Published Live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3.5 py-1 text-xs font-bold text-gray-600">
                <EyeOff size={13} /> Unpublished (Draft)
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 border-t border-gray-100 pt-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Price
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              ₹{Number(course.price).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Level
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              {course.level || "Beginner"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Duration
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              {course.duration || "Self-Paced"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Catalog Visibility
            </p>
            <p className="mt-1 text-base font-semibold text-gray-900">
              {course.is_published ? "Visible on /courses" : "Hidden from students"}
            </p>
          </div>
        </div>
      </section>

      {/* Modules & Curriculum Section */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Modules</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Organize your curriculum into structured learning modules.
            </p>
          </div>

          <button
            onClick={() => setShowModuleForm(!showModuleForm)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus size={16} /> Add Module
          </button>
        </div>

        {/* Add Module Form */}
        {showModuleForm && (
          <form
            onSubmit={handleCreateModule}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-4"
          >
            <h3 className="text-base font-bold text-gray-900">Add New Module</h3>

            {moduleError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {moduleError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Module Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={moduleForm.title}
                  onChange={handleModuleChange}
                  placeholder="e.g. Module 1: Introduction to Web Development"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={moduleForm.description}
                  onChange={handleModuleChange}
                  rows="3"
                  placeholder="What will students learn in this module?"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModuleForm(false)}
                className="rounded-lg border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={moduleLoading}
                className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {moduleLoading ? "Adding..." : "Add Module"}
              </button>
            </div>
          </form>
        )}

        {/* Modules List */}
        {modules.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <BookOpen size={40} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-base font-bold text-gray-800">No modules added yet</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add your first module to start creating lessons and uploading videos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {modules.map((mod, index) => (
              <div
                key={mod.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:border-gray-300 transition"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-bold text-xs text-gray-800">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{mod.title}</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        {mod.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => handleDeleteModule(mod.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 transition"
                      title="Delete module"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Lesson Materials</p>
                    <p className="text-xs text-gray-400">
                      Upload direct lecture videos, PDFs, and notes.
                    </p>
                  </div>

                  <Link
                    to={`/admin/modules/${mod.id}`}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition"
                  >
                    Manage Lessons & Upload Media →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Course Modal */}
      {showEditCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Edit Course Details</h3>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={courseForm.shortDescription}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      shortDescription: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price (INR)
                </label>
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, price: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) =>
                      setCourseForm({
                        ...courseForm,
                        duration: e.target.value,
                      })
                    }
                    placeholder="e.g. 10 Weeks"
                    className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Level
                  </label>
                  <select
                    value={courseForm.level}
                    onChange={(e) =>
                      setCourseForm({ ...courseForm, level: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white p-2.5 text-sm outline-none focus:border-black"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Description
                </label>
                <textarea
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditCourseModal(false)}
                  className="rounded-lg border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishLoading}
                  className="rounded-lg bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {publishLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourse;