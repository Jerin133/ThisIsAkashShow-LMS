import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { uploadCourseThumbnail, updateCourse } from "../../services/api";
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
  Upload,
  Image as ImageIcon,
  Check,
  Link as LinkIcon,
  X,
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

  const thumbnailInputRef = useRef(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const [courseForm, setCourseForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "",
    duration: "",
    level: "Beginner",
    thumbnailUrl: "",
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
      thumbnailUrl: data.thumbnail_url || "",
    });
    setPreviewError(false);
  };

  const handleThumbnailUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    try {
      setUploadingThumbnail(true);
      setError("");

      // Upload via backend server with service role bypass
      const res = await uploadCourseThumbnail(file);
      if (res?.success && res.data?.url) {
        setCourseForm((prev) => ({ ...prev, thumbnailUrl: res.data.url }));
        setPreviewError(false);
      } else {
        throw new Error(res?.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      // Fallback: try client supabase upload if backend is unreachable
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `course-thumb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const { error: uploadErr } = await supabase.storage
          .from("course-thumbnails")
          .upload(fileName, file, { cacheControl: "3600", upsert: true });

        if (uploadErr) throw uploadErr;

        const {
          data: { publicUrl },
        } = supabase.storage.from("course-thumbnails").getPublicUrl(fileName);

        setCourseForm((prev) => ({ ...prev, thumbnailUrl: publicUrl }));
        setPreviewError(false);
      } catch (sbErr) {
        setError("Failed to upload thumbnail: " + (err.response?.data?.message || err.message || sbErr.message));
      }
    } finally {
      setUploadingThumbnail(false);
      if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
    }
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
    e?.preventDefault?.();
    try {
      setPublishLoading(true);
      setError("");

      const payload = {
        title: courseForm.title.trim(),
        short_description: courseForm.shortDescription.trim(),
        description: courseForm.description.trim(),
        price: Number(courseForm.price) || 0,
        duration: courseForm.duration.trim(),
        level: courseForm.level,
        thumbnail_url: courseForm.thumbnailUrl?.trim() || null,
      };

      let updatedData = null;

      // 1. Try Backend API
      try {
        const res = await updateCourse(courseId, payload);
        if (res?.success && res.data) {
          updatedData = res.data;
        }
      } catch (apiErr) {
        console.warn("Backend updateCourse endpoint error, trying Supabase direct:", apiErr);
      }

      // 2. Fallback to Supabase client if API didn't respond
      if (!updatedData) {
        const { data, error: sbError } = await supabase
          .from("courses")
          .update({
            ...payload,
            updated_at: new Date().toISOString(),
          })
          .eq("id", courseId)
          .select()
          .single();

        if (sbError) throw sbError;
        updatedData = data;
      }

      setCourse(updatedData);
      setCourseForm({
        title: updatedData.title || "",
        shortDescription: updatedData.short_description || "",
        description: updatedData.description || "",
        price: updatedData.price || "",
        duration: updatedData.duration || "",
        level: updatedData.level || "Beginner",
        thumbnailUrl: updatedData.thumbnail_url || "",
      });
      setShowEditCourseModal(false);
      setSuccessMessage("Course details updated successfully!");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || "Failed to update course.");
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-24 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-2xs">
              <img
                src={course.thumbnail_url || "/images/digital-marketing-cartoon.jpg"}
                alt={course.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/digital-marketing-cartoon.jpg";
                }}
              />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Course Information</h2>
              <p className="text-xs text-gray-500">Overview, thumbnail & pricing details</p>
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

      {/* Edit Course Modal (Responsive & Scrollable) */}
      {showEditCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl bg-white shadow-2xl overflow-hidden my-auto border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Sticky Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Edit Course Details</h3>
                <p className="text-[11px] text-slate-500">Update course metadata, pricing, and thumbnail</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCourseModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Form Body */}
            <form
              id="edit-course-form"
              onSubmit={handleUpdateCourse}
              className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
            >
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              {/* Course Thumbnail Setting */}
              <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 sm:p-4">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-800">
                    Course Thumbnail
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    16:9 Aspect
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start gap-3.5">
                  <div className="h-20 w-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative shadow-2xs mx-auto sm:mx-0">
                    <img
                      key={courseForm.thumbnailUrl || "thumb-preview"}
                      src={
                        previewError || !courseForm.thumbnailUrl
                          ? "/images/digital-marketing-cartoon.jpg"
                          : courseForm.thumbnailUrl
                      }
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover"
                      onError={() => setPreviewError(true)}
                    />
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="file"
                      ref={thumbnailInputRef}
                      onChange={handleThumbnailUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploadingThumbnail}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                    >
                      {uploadingThumbnail ? (
                        <>
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          <span>Uploading image...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} className="text-emerald-600" />
                          <span>Upload From Computer</span>
                        </>
                      )}
                    </button>

                    <div className="relative">
                      <input
                        type="text"
                        value={courseForm.thumbnailUrl}
                        onChange={(e) => {
                          setCourseForm((prev) => ({ ...prev, thumbnailUrl: e.target.value.trim() }));
                          setPreviewError(false);
                        }}
                        placeholder="Paste image URL (https://...)"
                        className="w-full rounded-lg border border-slate-300 bg-white pl-8 pr-3 py-2 text-xs outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                      />
                      <LinkIcon size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {previewError && courseForm.thumbnailUrl && (
                      <p className="text-[10px] text-amber-600 font-medium">
                        ⚠️ Couldn't load image from this URL. Please verify the link or pick a preset below.
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="pt-2 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1.5">Quick Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: "Marketing Cartoon", url: "/images/digital-marketing-cartoon.jpg" },
                      { label: "Master Akash", url: "/images/instructor-hero.jpg" },
                      { label: "Student Classroom", url: "/images/hero-student.jpg" },
                      { label: "Default", url: "/images/course-default.jpg" },
                    ].map((p) => (
                      <button
                        key={p.url}
                        type="button"
                        onClick={() => {
                          setCourseForm((prev) => ({ ...prev, thumbnailUrl: p.url }));
                          setPreviewError(false);
                        }}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition cursor-pointer ${
                          courseForm.thumbnailUrl === p.url
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-bold shadow-2xs"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
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
            </form>

            {/* Modal Sticky Footer - Always Visible on Mobile & Desktop */}
            <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/95 shrink-0">
              <button
                type="button"
                onClick={() => setShowEditCourseModal(false)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-course-form"
                disabled={publishLoading}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-black transition shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {publishLoading && (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>{publishLoading ? "Saving Changes..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCourse;