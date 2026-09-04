import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  PlayCircle,
  FileText,
  Upload,
  CheckCircle,
  AlertCircle,
  Video,
  Eye,
  EyeOff,
} from "lucide-react";

const ManageModule = () => {
  const { moduleId } = useParams();

  const [module, setModule] = useState(null);
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);

  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);

  const [error, setError] = useState("");
  const [lessonError, setLessonError] = useState("");

  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState(null);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    durationMinutes: "",
    isFree: false,
    isPublished: true,
    notesContent: "",
  });

  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [uploadingNotesLessonId, setUploadingNotesLessonId] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const fetchModule = async () => {
    const { data, error } = await supabase
      .from("modules")
      .select("*")
      .eq("id", moduleId)
      .single();

    if (error) throw error;
    setModule(data);
    return data;
  };

  const fetchCourse = async (courseId) => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (error) throw error;
    setCourse(data);
  };

  const fetchLessons = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });

    if (error) throw error;
    setLessons(data || []);
  };

  const loadPage = async () => {
    try {
      setLoading(true);
      setError("");
      const moduleData = await fetchModule();
      await fetchCourse(moduleData.course_id);
      await fetchLessons();
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, [moduleId]);

  const handleLessonChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLessonForm({
      ...lessonForm,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleCreateOrUpdateLesson = async (e) => {
    e.preventDefault();
    setLessonError("");

    if (!lessonForm.title.trim()) {
      setLessonError("Lesson title is required.");
      return;
    }

    const durationMinutes = Number(lessonForm.durationMinutes) || 0;
    const durationSeconds = durationMinutes * 60;

    try {
      setLessonLoading(true);

      if (editingLessonId) {
        // Update existing lesson
        const { error } = await supabase
          .from("lessons")
          .update({
            title: lessonForm.title.trim(),
            description: lessonForm.description.trim(),
            duration_seconds: durationSeconds,
            is_free: lessonForm.isFree,
            is_published: lessonForm.isPublished,
            notes_content: lessonForm.notesContent.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingLessonId);

        if (error) throw error;
      } else {
        // Insert new lesson
        const nextOrder =
          lessons.length > 0
            ? Math.max(...lessons.map((lesson) => lesson.order_index)) + 1
            : 1;

        const { error } = await supabase.from("lessons").insert({
          module_id: moduleId,
          title: lessonForm.title.trim(),
          description: lessonForm.description.trim(),
          duration_seconds: durationSeconds,
          order_index: nextOrder,
          is_free: lessonForm.isFree,
          is_published: lessonForm.isPublished,
          notes_content: lessonForm.notesContent.trim(),
          video_path: null,
          notes_path: null,
          thumbnail_path: null,
        });

        if (error) throw error;
      }

      setLessonForm({
        title: "",
        description: "",
        durationMinutes: "",
        isFree: false,
        isPublished: true,
        notesContent: "",
      });

      setShowLessonForm(false);
      setEditingLessonId(null);
      await fetchLessons();
    } catch (error) {
      console.error(error);
      setLessonError(error.message);
    } finally {
      setLessonLoading(false);
    }
  };

  const startEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      durationMinutes: Math.round((lesson.duration_seconds || 0) / 60),
      isFree: Boolean(lesson.is_free),
      isPublished: Boolean(lesson.is_published),
      notesContent: lesson.notes_content || "",
    });
    setShowLessonForm(true);
  };

  const handleDeleteLesson = async (lessonId) => {
    const confirmed = window.confirm("Are you sure you want to delete this lesson?");
    if (!confirmed) return;

    try {
      const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
      if (error) throw error;
      await fetchLessons();
    } catch (error) {
      console.error(error);
      setLessonError(error.message);
    }
  };

  // Direct Self-Hosted Video Upload
  const handleVideoUpload = async (lesson, file) => {
    if (!file) return;
    setUploadError("");
    setUploadSuccess("");

    if (!file.type.startsWith("video/")) {
      setUploadError("Please select a valid video file (MP4, WebM, QuickTime).");
      return;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setUploadError("Video size must be less than 500 MB.");
      return;
    }

    try {
      setUploadingLessonId(lesson.id);
      const fileExtension = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExtension}`;
      const filePath = `${module.course_id}/${module.id}/${lesson.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-videos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { error: databaseError } = await supabase
        .from("lessons")
        .update({
          video_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lesson.id);

      if (databaseError) throw databaseError;

      setUploadSuccess(`Video uploaded successfully for lesson "${lesson.title}"!`);
      await fetchLessons();
    } catch (error) {
      console.error(error);
      setUploadError(error.message || "Video upload failed.");
    } finally {
      setUploadingLessonId(null);
    }
  };

  // Direct Notes (PDF / Document) Upload
  const handleNotesUpload = async (lesson, file) => {
    if (!file) return;
    setUploadError("");
    setUploadSuccess("");

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setUploadError("Notes file size must be less than 50 MB.");
      return;
    }

    try {
      setUploadingNotesLessonId(lesson.id);
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${module.course_id}/${module.id}/${lesson.id}/${Date.now()}_${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("course-notes")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { error: databaseError } = await supabase
        .from("lessons")
        .update({
          notes_path: filePath,
          updated_at: new Date().toISOString(),
        })
        .eq("id", lesson.id);

      if (databaseError) throw databaseError;

      setUploadSuccess(`Study notes attached successfully for lesson "${lesson.title}"!`);
      await fetchLessons();
    } catch (error) {
      console.error(error);
      setUploadError(error.message || "Notes upload failed. Make sure 'course-notes' bucket exists in Supabase Storage.");
    } finally {
      setUploadingNotesLessonId(null);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds <= 0) return "Duration not set";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds === 0
      ? `${minutes} min`
      : `${minutes} min ${remainingSeconds} sec`;
  };

  if (loading) {
    return <div className="p-8 text-gray-500">Loading module curriculum...</div>;
  }

  if (error || !module) {
    return (
      <div className="p-8">
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {error || "Module not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          to={`/admin/courses/${module.course_id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
        >
          <ArrowLeft size={16} /> Back to Course Overview
        </Link>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
          {course?.title || "Course"}
        </p>
        <h1 className="mt-1 text-3xl font-bold text-gray-900">{module.title}</h1>
        <p className="mt-2 text-sm text-gray-600">
          {module.description || "Organize lectures, upload direct video files, and attach student notes."}
        </p>
      </div>

      {uploadSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          <CheckCircle size={18} className="shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Lessons List Section */}
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Module Lessons</h2>
            <p className="text-xs text-gray-500">
              Students who purchase the course will be authorized to access these videos & notes.
            </p>
          </div>

          <button
            onClick={() => {
              setEditingLessonId(null);
              setLessonForm({
                title: "",
                description: "",
                durationMinutes: "",
                isFree: false,
                isPublished: true,
                notesContent: "",
              });
              setShowLessonForm(!showLessonForm);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition shadow-sm"
          >
            <Plus size={16} /> Add New Lesson
          </button>
        </div>

        {/* Add / Edit Lesson Form Modal Card */}
        {showLessonForm && (
          <form
            onSubmit={handleCreateOrUpdateLesson}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-5"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {editingLessonId ? "Edit Lesson Details" : "Create New Lesson"}
              </h3>
              <button
                type="button"
                onClick={() => setShowLessonForm(false)}
                className="text-xs text-gray-500 hover:text-black"
              >
                Cancel
              </button>
            </div>

            {lessonError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
                {lessonError}
              </div>
            )}

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={lessonForm.title}
                  onChange={handleLessonChange}
                  placeholder="e.g. 01 - Understanding React Fundamentals"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lesson Description
                </label>
                <textarea
                  name="description"
                  value={lessonForm.description}
                  onChange={handleLessonChange}
                  rows="3"
                  placeholder="Summary of what is covered in this video lecture..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Estimated Duration (Minutes)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  value={lessonForm.durationMinutes}
                  onChange={handleLessonChange}
                  min="0"
                  placeholder="e.g. 20"
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm outline-none focus:border-black"
                />
              </div>

              <div className="flex flex-col justify-center space-y-2">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFree"
                    checked={lessonForm.isFree}
                    onChange={handleLessonChange}
                    className="h-4 w-4 rounded text-black"
                  />
                  <span>Free Preview Lesson (Publicly accessible without purchase)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={lessonForm.isPublished}
                    onChange={handleLessonChange}
                    className="h-4 w-4 rounded text-black"
                  />
                  <span>Published (Visible to students)</span>
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Lecture Study Notes (Text / Markdown summary)
                </label>
                <textarea
                  name="notesContent"
                  value={lessonForm.notesContent}
                  onChange={handleLessonChange}
                  rows="4"
                  placeholder="Enter key lecture notes, formulas, or code snippets for students..."
                  className="w-full rounded-lg border border-gray-300 p-2.5 text-sm font-mono outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t pt-4">
              <button
                type="button"
                onClick={() => setShowLessonForm(false)}
                className="rounded-lg border px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={lessonLoading}
                className="rounded-lg bg-black px-6 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {lessonLoading ? "Saving..." : editingLessonId ? "Update Lesson" : "Create Lesson"}
              </button>
            </div>
          </form>
        )}

        {/* Lessons List */}
        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <PlayCircle size={40} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-base font-bold text-gray-800">No lessons created yet</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add your first lesson to start uploading lecture videos and notes.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs hover:border-gray-300 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 font-bold text-xs text-gray-700">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-gray-900">{lesson.title}</h3>
                        {lesson.is_free ? (
                          <span className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5 text-[10px] font-bold">
                            FREE PREVIEW
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[10px] font-bold">
                            PAID ENROLLED ONLY
                          </span>
                        )}
                        {lesson.is_published ? (
                          <span className="rounded-full bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <Eye size={11} /> Published
                          </span>
                        ) : (
                          <span className="rounded-full bg-gray-100 text-gray-600 px-2.5 py-0.5 text-[10px] font-bold flex items-center gap-1">
                            <EyeOff size={11} /> Draft
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {formatDuration(lesson.duration_seconds)} •{" "}
                        {lesson.description || "No description provided."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => startEditLesson(lesson)}
                      className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 hover:text-black transition"
                      title="Edit Lesson"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50 transition"
                      title="Delete Lesson"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Upload & Media Status Controls */}
                <div className="mt-5 grid gap-4 border-t border-gray-100 pt-4 sm:grid-cols-2">
                  {/* Video Upload Box */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video size={16} className="text-gray-700" />
                        <span className="text-xs font-bold text-gray-800">Lecture Video</span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          lesson.video_path ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {lesson.video_path ? "✓ Video Attached" : "Missing Video"}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-1">
                      Direct self-hosted video (MP4/WebM). Protected with DRM watermark & token streaming.
                    </p>

                    <label
                      className={`mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white cursor-pointer transition ${
                        uploadingLessonId === lesson.id
                          ? "bg-gray-400"
                          : "bg-black hover:bg-gray-800"
                      }`}
                    >
                      <Upload size={13} />
                      {uploadingLessonId === lesson.id
                        ? "Uploading Video (500MB max)..."
                        : lesson.video_path
                        ? "Replace Video"
                        : "Upload Direct Video"}
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime"
                        className="hidden"
                        disabled={uploadingLessonId === lesson.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleVideoUpload(lesson, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>

                  {/* Notes PDF / Document Upload Box */}
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-gray-700" />
                        <span className="text-xs font-bold text-gray-800">Study Notes & PDF</span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          lesson.notes_path ? "text-emerald-600" : "text-gray-400"
                        }`}
                      >
                        {lesson.notes_path ? "✓ Notes Attached" : "No PDF"}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-1">
                      Attach lecture slides, PDF guidebooks, or assignment materials for enrolled students.
                    </p>

                    <label
                      className={`mt-3 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold text-white cursor-pointer transition ${
                        uploadingNotesLessonId === lesson.id
                          ? "bg-gray-400"
                          : "bg-gray-800 hover:bg-gray-700"
                      }`}
                    >
                      <Upload size={13} />
                      {uploadingNotesLessonId === lesson.id
                        ? "Uploading Notes..."
                        : lesson.notes_path
                        ? "Replace Study Notes PDF"
                        : "Upload Study Notes PDF"}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.zip,.txt"
                        className="hidden"
                        disabled={uploadingNotesLessonId === lesson.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleNotesUpload(lesson, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ManageModule;