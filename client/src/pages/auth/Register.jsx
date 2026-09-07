import { useState } from "react";
import { registerUser } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus, Sparkles, CheckCircle, BookOpen, TrendingUp, Shield, ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      await registerUser(form.email, form.password, form.fullName);
      setMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: BookOpen, label: "Full lifetime access to enrolled modules" },
    { icon: Shield, label: "Encrypted HD video stream playback" },
    { icon: TrendingUp, label: "Automatic lecture progress tracking" },
    { icon: CheckCircle, label: "Downloadable lesson notes & syllabus" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Visible Stock Market Chart Texture */}
        <div className="absolute inset-0 opacity-25 mix-blend-screen pointer-events-none">
          <img
            src="/images/trading-chart-bg.jpg"
            alt="Trading Chart Background"
            className="w-full h-full object-cover object-center filter grayscale contrast-125"
          />
        </div>

        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/images/akash-logo.jpg"
              alt="ThisIsAkashShow"
              className="h-11 w-11 rounded-full object-cover border-2 border-emerald-400/60 shadow-md bg-slate-900/40"
              onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
            />
            <span className="text-xl font-black text-white tracking-tight">ThisIsAkashShow</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Start your<br />
              <span className="text-emerald-400">learning journey</span>
            </h2>
            <p className="mt-4 text-emerald-100/90 text-base leading-relaxed max-w-sm">
              Join to master the marketing and earning strategies with Akash.
            </p>
          </div>

          <div className="space-y-4">
            {perks.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-300 border border-white/10">
                  <Icon size={16} />
                </div>
                <span className="text-sm text-emerald-100 font-medium">{label}</span>
              </div>
            ))}
          </div>


        </div>

        <div className="relative z-10">
          <p className="text-xs text-emerald-300/80">© 2026 ThisIsAkashShow. All rights reserved.</p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <img
              src="/images/akash-logo.png"
              alt="ThisIsAkashShow"
              className="h-9 w-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm bg-slate-50"
              onError={(e) => { e.currentTarget.src = "/images/akash-logo.jpg"; }}
            />
            <span className="text-lg font-black text-slate-900">ThisIsAkashShow</span>
          </div>

          <div className="mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition mb-6"
            >
              <ArrowLeft size={15} />
              Back to Home
            </Link>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create an account</h1>
            <p className="mt-2 text-slate-500 text-sm">Free to join. Start learning immediately after signup.</p>
          </div>

          {/* Success state */}
          {message && (
            <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-4 flex items-center gap-3">
              <CheckCircle size={20} className="text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="Your full name"
                value={form.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm shadow-emerald-500/25"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Create Free Account
                </>
              )}
            </button>

            <p className="text-xs text-center text-slate-400">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;