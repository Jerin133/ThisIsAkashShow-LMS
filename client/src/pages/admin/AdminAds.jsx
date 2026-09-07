import { useState, useEffect, useRef } from "react";
import {
  Plus, Trash2, ToggleLeft, ToggleRight, ExternalLink,
  Upload, Link2, ImageIcon, Tag, ArrowUp, ArrowDown, X, Edit2, Save
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminAds() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const blankForm = {
    title: "",
    affiliate_link: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  };
  const [form, setForm] = useState(blankForm);
  const [imageFile, setImageFile] = useState(null);

  const token = () => {
    try {
      const raw = localStorage.getItem("supabase.auth.token") ||
        Object.values(localStorage).find(v => {
          try { return JSON.parse(v)?.access_token; } catch { return false; }
        });
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return parsed?.access_token || parsed?.session?.access_token || "";
    } catch { return ""; }
  };

  const authHeader = () => ({ Authorization: `Bearer ${token()}` });

  const fetchAds = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ads/all`, { headers: authHeader() });
      const json = await res.json();
      if (json.success) setAds(json.data || []);
    } catch (e) {
      setError("Failed to load ads");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAds(); }, []);

  const flash = (type, msg) => {
    if (type === "success") { setSuccess(msg); setTimeout(() => setSuccess(""), 3500); }
    else { setError(msg); setTimeout(() => setError(""), 4000); }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setForm(f => ({ ...f, image_url: "" }));
  };

  const resetForm = () => {
    setForm(blankForm);
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
    setShowForm(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const openEdit = (ad) => {
    setForm({
      title: ad.title || "",
      affiliate_link: ad.affiliate_link || "",
      image_url: ad.image_url || "",
      display_order: ad.display_order || 0,
      is_active: ad.is_active,
    });
    setImagePreview(ad.image_url || null);
    setImageFile(null);
    setEditingId(ad.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.affiliate_link) return flash("error", "Affiliate link is required");
    if (!imageFile && !form.image_url) return flash("error", "An image is required");
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      fd.append("affiliate_link", form.affiliate_link);
      fd.append("display_order", form.display_order);
      fd.append("is_active", form.is_active);
      if (imageFile) fd.append("image", imageFile);
      else if (form.image_url) fd.append("image_url", form.image_url);

      const url = editingId
        ? `${API_URL}/api/ads/${editingId}`
        : `${API_URL}/api/ads`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, { method, headers: authHeader(), body: fd });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      flash("success", editingId ? "Ad updated!" : "Ad created!");
      resetForm();
      fetchAds();
    } catch (err) {
      flash("error", err.message || "Failed to save ad");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (ad) => {
    try {
      const fd = new FormData();
      fd.append("is_active", !ad.is_active);
      const res = await fetch(`${API_URL}/api/ads/${ad.id}`, {
        method: "PUT",
        headers: authHeader(),
        body: fd,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, is_active: !a.is_active } : a));
    } catch (err) {
      flash("error", err.message);
    }
  };

  const deleteAd = async (id) => {
    if (!window.confirm("Delete this ad permanently?")) return;
    try {
      const res = await fetch(`${API_URL}/api/ads/${id}`, {
        method: "DELETE",
        headers: authHeader(),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      flash("success", "Ad deleted");
      setAds(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      flash("error", err.message);
    }
  };

  const moveOrder = async (ad, direction) => {
    const newOrder = ad.display_order + direction;
    try {
      const fd = new FormData();
      fd.append("display_order", newOrder);
      await fetch(`${API_URL}/api/ads/${ad.id}`, {
        method: "PUT", headers: authHeader(), body: fd,
      });
      fetchAds();
    } catch (_) {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Affiliate Ads
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage banner ads shown across all public pages
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-emerald-200"
        >
          <Plus size={17} /> New Ad
        </button>
      </div>

      {/* Flash messages */}
      {success && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          ❌ {error}
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-lg font-black text-slate-800">
              {editingId ? "Edit Ad" : "Create New Ad"}
            </h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-700 transition">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                Ad Image *
              </label>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Preview */}
                <div
                  className="relative h-32 w-56 flex-shrink-0 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden cursor-pointer hover:border-emerald-400 transition group"
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400 group-hover:text-emerald-500 transition">
                      <ImageIcon size={28} />
                      <span className="text-xs font-semibold">Click to upload</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                    {imagePreview && (
                      <Upload size={20} className="text-white opacity-0 group-hover:opacity-100 transition" />
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:text-emerald-700 transition"
                  >
                    <Upload size={15} /> Upload Image File
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                  <p className="text-slate-400 text-xs">— or paste an image URL —</p>
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={form.image_url}
                    onChange={e => {
                      setForm(f => ({ ...f, image_url: e.target.value }));
                      setImagePreview(e.target.value);
                      setImageFile(null);
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                <Tag size={12} className="inline mr-1" /> Ad Title (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Best Trading Tool 2025"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>

            {/* Affiliate Link */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                <Link2 size={12} className="inline mr-1" /> Affiliate Link *
              </label>
              <input
                type="url"
                placeholder="https://your-affiliate-link.com/ref=xyz"
                value={form.affiliate_link}
                onChange={e => setForm(f => ({ ...f, affiliate_link: e.target.value }))}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
              />
            </div>

            {/* Display Order + Active toggle */}
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                  Display Order
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.display_order}
                  onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-3 pb-1">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Active</span>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, is_active: !f.is_active }))}
                  className={`transition ${form.is_active ? "text-emerald-500" : "text-slate-300"}`}
                >
                  {form.is_active ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex gap-3 justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition shadow-md shadow-emerald-200"
              >
                <Save size={15} />
                {submitting ? "Saving..." : editingId ? "Update Ad" : "Create Ad"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Ads Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : ads.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <ImageIcon size={48} className="text-slate-300 mb-4" />
          <p className="text-lg font-bold text-slate-500">No ads yet</p>
          <p className="text-sm text-slate-400 mt-1">Click "New Ad" to create your first affiliate banner</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {ads.map((ad, idx) => (
            <div
              key={ad.id}
              className={`group relative rounded-2xl border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md ${
                ad.is_active ? "border-slate-200" : "border-slate-100 opacity-60"
              }`}
            >
              {/* Ad Image */}
              <div className="relative h-36 bg-slate-100 overflow-hidden">
                <img
                  src={ad.image_url}
                  alt={ad.title || "Ad"}
                  className="h-full w-full object-cover"
                  onError={e => { e.currentTarget.src = "https://placehold.co/560x224?text=Ad+Image"; }}
                />
                {/* Status badge */}
                <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                  ad.is_active
                    ? "bg-emerald-500 text-white"
                    : "bg-slate-400 text-white"
                }`}>
                  {ad.is_active ? "Live" : "Paused"}
                </span>
              </div>

              {/* Ad Info */}
              <div className="p-4">
                <p className="font-bold text-slate-800 text-sm truncate">
                  {ad.title || <span className="text-slate-400 italic">No title</span>}
                </p>
                <a
                  href={ad.affiliate_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-semibold truncate"
                >
                  <ExternalLink size={11} />
                  <span className="truncate">{ad.affiliate_link}</span>
                </a>
                <p className="text-[10px] text-slate-400 mt-1">Order: {ad.display_order}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 gap-2">
                {/* Order controls */}
                <div className="flex gap-1">
                  <button
                    onClick={() => moveOrder(ad, -1)}
                    disabled={idx === 0}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition"
                    title="Move up"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    onClick={() => moveOrder(ad, 1)}
                    disabled={idx === ads.length - 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 disabled:opacity-30 transition"
                    title="Move down"
                  >
                    <ArrowDown size={14} />
                  </button>
                </div>

                <div className="flex gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => toggleActive(ad)}
                    className={`p-1.5 rounded-lg transition ${
                      ad.is_active
                        ? "text-emerald-500 hover:bg-emerald-50"
                        : "text-slate-400 hover:bg-slate-50"
                    }`}
                    title={ad.is_active ? "Pause ad" : "Activate ad"}
                  >
                    {ad.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(ad)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteAd(ad.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
