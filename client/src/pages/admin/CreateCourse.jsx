import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { uploadCourseThumbnail } from "../../services/api";
import {
  Upload,
  Image as ImageIcon,
  Check,
  Sparkles,
  Link as LinkIcon,
  Star,
  Clock,
  ArrowRight,
} from "lucide-react";

const PRESET_THUMBNAILS = [
  {
    title: "Digital Marketing Cartoon",
    url: "/images/digital-marketing-cartoon.jpg",
    tag: "Cartoon Illustration",
  },
  {
    title: "Master Mentorship",
    url: "/images/instructor-hero.jpg",
    tag: "Instructor Photo",
  },
  {
    title: "Student Academy",
    url: "/images/hero-student.jpg",
    tag: "Classroom",
  },
  {
    title: "Default Branding",
    url: "/images/course-default.jpg",
    tag: "Standard",
  },
];

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "",
    duration: "",
    level: "Beginner",
    thumbnailUrl: "/images/digital-marketing-cartoon.jpg",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
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

      const res = await uploadCourseThumbnail(file);
      if (res?.success && res.data?.url) {
        setForm((prev) => ({ ...prev, thumbnailUrl: res.data.url }));
      } else {
        throw new Error(res?.message || "Failed to upload image");
      }
    } catch (err) {
      console.error("Upload error:", err);
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `course-thumb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

        const { data, error: uploadErr } = await supabase.storage
          .from("course-thumbnails")
          .upload(fileName, file, { cacheControl: "3600", upsert: true });

        if (uploadErr) throw uploadErr;

        const {
          data: { publicUrl },
        } = supabase.storage.from("course-thumbnails").getPublicUrl(fileName);

        setForm((prev) => ({ ...prev, thumbnailUrl: publicUrl }));
      } catch (sbErr) {
        setError("Failed to upload thumbnail: " + (err.response?.data?.message || err.message || sbErr.message));
      }
    } finally {
      setUploadingThumbnail(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Course title is required.");
      return;
    }

    if (!form.description.trim()) {
      setError("Course description is required.");
      return;
    }

    try {
      setLoading(true);

      const slug = createSlug(form.title);

      const { data, error } = await supabase
        .from("courses")
        .insert({
          title: form.title.trim(),
          slug,
          short_description: form.shortDescription.trim(),
          description: form.description.trim(),
          price: Number(form.price) || 0,
          duration: form.duration.trim(),
          level: form.level,
          thumbnail_url: form.thumbnailUrl || "/images/digital-marketing-cartoon.jpg",
          instructor_id: user.id,
          is_published: false,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      navigate(`/admin/courses/${data.id}`);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Course Management</p>
        <h1 className="mt-1 text-3xl font-extrabold text-slate-900 tracking-tight">Create New Course</h1>
        <p className="mt-1 text-slate-500 text-sm">
          Set up basic details, course thumbnail, and pricing for your new curriculum.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Basic Information ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
            Basic Information
          </h2>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Course Title *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Master Digital Marketing & SEO Growth [2026]"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Short Subtitle / Summary</label>
            <input
              type="text"
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              placeholder="e.g. Real-world campaigns, search ranking frameworks & conversion hacks"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700">Full Description *</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows="5"
              placeholder="Describe everything students will master throughout this curriculum..."
              className="w-full rounded-xl border border-slate-200 p-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              required
            />
          </div>
        </section>

        {/* ── Course Thumbnail Section ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Course Thumbnail</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                This image appears across all Udemy-style course cards on the homepage, catalog, and dashboard.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-xs font-bold">
              16:9 Aspect Ratio
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Upload & Presets */}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Upload Image File</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleThumbnailUpload}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingThumbnail}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/60 hover:bg-emerald-50/30 p-5 text-sm font-semibold text-slate-700 transition cursor-pointer"
                >
                  {uploadingThumbnail ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                      <span>Uploading to Supabase Storage...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={18} className="text-emerald-600" />
                      <span>Click to select image file from computer</span>
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">Or Image URL</label>
                <div className="relative">
                  <input
                    type="url"
                    name="thumbnailUrl"
                    value={form.thumbnailUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/thumbnail.jpg"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                  <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="mb-2 block text-xs font-bold text-slate-700">Or Pick a Curated Preset</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {PRESET_THUMBNAILS.map((preset) => {
                    const isSelected = form.thumbnailUrl === preset.url;
                    return (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, thumbnailUrl: preset.url }))}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                            : "border-slate-200 hover:border-slate-300 bg-white"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.title}
                          className="h-10 w-14 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">{preset.title}</p>
                          <p className="text-[10px] text-slate-400 truncate">{preset.tag}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-emerald-600 ml-auto shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live Preview Card */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Live Card Preview (Udemy Style)
              </p>
              <div className="max-w-[320px] rounded-2xl border border-slate-200/90 bg-white shadow-md overflow-hidden">
                <div className="aspect-video w-full bg-slate-100 overflow-hidden relative border-b border-slate-100">
                  <img
                    src={form.thumbnailUrl || "/images/digital-marketing-cartoon.jpg"}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/images/digital-marketing-cartoon.jpg";
                    }}
                  />
                  <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 backdrop-blur-md px-2 py-0.5 text-[10px] font-bold text-slate-800 border border-slate-200 shadow-2xs">
                    {form.level}
                  </span>
                </div>
                <div className="p-4 space-y-2.5">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                    {form.title || "Course Title Preview"}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                    {form.shortDescription || "Short course overview preview"}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      Bestseller
                    </span>
                    <span className="font-bold text-xs text-amber-500 flex items-center gap-0.5">
                      <Star size={12} className="fill-amber-400 text-amber-400 inline" /> 4.8
                    </span>
                    <span className="text-slate-400 text-[11px]">(New)</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-extrabold text-slate-900 text-base">
                      {form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "₹499"}
                    </span>
                    <span className="rounded-lg border border-emerald-600 text-emerald-700 px-3 py-1 text-[11px] font-bold">
                      View Course
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Course Details (Price, Duration, Level) ── */}
        <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs space-y-5">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Pricing & Details</h2>

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Price (INR)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="499"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Duration</label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="e.g. 10 Hours / 8 Weeks"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700">Skill Level</label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </section>

        {/* ── Form Actions ── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 font-bold text-sm text-slate-700 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || uploadingThumbnail}
            className="rounded-xl bg-emerald-600 px-7 py-3 font-bold text-sm text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Creating Course..." : "Create Course"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateCourse;