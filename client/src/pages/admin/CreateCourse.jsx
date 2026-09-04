import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const CreateCourse = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    shortDescription: "",
    description: "",
    price: "",
    duration: "",
    level: "Beginner",
  });

  const [loading, setLoading] = useState(false);
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
          short_description:
            form.shortDescription.trim(),
          description: form.description.trim(),
          price: Number(form.price) || 0,
          duration: form.duration.trim(),
          level: form.level,
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
    <div className="p-6 md:p-8">

      <div className="mb-8">

        <p className="text-sm text-gray-500">
          Course Management
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Create Course
        </h1>

        <p className="mt-2 text-gray-600">
          Add the basic information for your new course.
        </p>

      </div>


      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}


      <form
        onSubmit={handleSubmit}
        className="max-w-4xl space-y-8"
      >

        {/* Basic Information */}

        <section className="rounded-xl border bg-white p-6">

          <h2 className="text-xl font-semibold">
            Basic Information
          </h2>

          <div className="mt-6 space-y-5">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Course Title
              </label>

              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Full Stack Web Development"
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
                required
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">
                Short Description
              </label>

              <input
                type="text"
                name="shortDescription"
                value={form.shortDescription}
                onChange={handleChange}
                placeholder="A short summary of the course"
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="6"
                placeholder="Describe what students will learn..."
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
                required
              />

            </div>

          </div>

        </section>


        {/* Course Details */}

        <section className="rounded-xl border bg-white p-6">

          <h2 className="text-xl font-semibold">
            Course Details
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">

            <div>

              <label className="mb-2 block text-sm font-medium">
                Price (INR)
              </label>

              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="4999"
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">
                Duration
              </label>

              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="12 Weeks"
                className="w-full rounded-lg border p-3 outline-none focus:border-black"
              />

            </div>


            <div>

              <label className="mb-2 block text-sm font-medium">
                Level
              </label>

              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="w-full rounded-lg border bg-white p-3 outline-none focus:border-black"
              >
                <option value="Beginner">
                  Beginner
                </option>

                <option value="Intermediate">
                  Intermediate
                </option>

                <option value="Advanced">
                  Advanced
                </option>
              </select>

            </div>

          </div>

        </section>


        {/* Actions */}

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() => navigate("/admin/courses")}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 font-bold text-xs text-slate-700 hover:bg-slate-50 transition shadow-2xs"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-xs text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Course"}
          </button>

        </div>

      </form>

    </div>
  );
};

export default CreateCourse;