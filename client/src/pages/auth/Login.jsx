import { useState } from "react";
import { loginUser, resetPassword } from "../../services/auth";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import {
  Eye,
  EyeOff,
  LogIn,
  BookOpen,
  Shield,
  TrendingUp,
  ArrowLeft,
  Mail,
  CheckCircle2,
  AlertCircle,
  KeyRound,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState("login"); // "login" | "forgot"
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await loginUser(form.email, form.password);
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profileError) throw profileError;
      navigate(profile.role === "admin" ? "/admin/dashboard" : "/student/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError("");
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err) {
      setForgotError(err.message || "Failed to send reset link. Please check your email and try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const switchToForgot = () => {
    setForgotEmail(form.email);
    setForgotError("");
    setForgotSuccess(false);
    setViewMode("forgot");
  };

  const switchToLogin = () => {
    setError("");
    setViewMode("login");
  };

  const features = [
    { icon: BookOpen, text: "Access structured video courses" },
    { icon: TrendingUp, text: "Track your learning progress" },
    { icon: Shield, text: "Secure, protected content delivery" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        {/* Subtle decorative grid/orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />
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
              Accelerate your<br />
              <span className="text-emerald-400">learning journey</span>
            </h2>
            <p className="mt-4 text-emerald-100/90 text-base leading-relaxed max-w-sm">
              Access your digital marketing courses, live masterclasses, and grow your digital skills every day.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-emerald-300 border border-white/10">
                  <Icon size={16} />
                </div>
                <span className="text-sm text-emerald-100 font-medium">{text}</span>
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

          {/* ================= FORGOT PASSWORD VIEW ================= */}
          {viewMode === "forgot" ? (
            <div>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition mb-6"
                >
                  <ArrowLeft size={15} />
                  Back to Sign In
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-2xs">
                    <KeyRound size={20} />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Reset Password
                  </h1>
                </div>
                <p className="mt-2 text-slate-500 text-sm">
                  Enter your registered account email and we'll send you a password reset link.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="space-y-6">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-5 text-emerald-900 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-bold text-emerald-950">Password reset link sent!</p>
                        <p className="mt-1 text-emerald-800 leading-relaxed">
                          We sent an email to <span className="font-semibold text-emerald-950">{forgotEmail}</span> with instructions to reset your password.
                        </p>
                        <p className="mt-2 text-xs text-emerald-700">
                          Please check your spam/junk folder if you don't receive it within a couple of minutes.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 active:scale-[0.98] shadow-sm shadow-emerald-500/25"
                    >
                      Return to Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setForgotSuccess(false);
                        setForgotError("");
                      }}
                      className="w-full text-center text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
                    >
                      Didn't receive email? Try another address
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label htmlFor="forgot-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        id="forgot-email"
                        type="email"
                        name="forgotEmail"
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                        className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                  </div>

                  {/* Error Alert */}
                  {forgotError && (
                    <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                      <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm shadow-emerald-500/25"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending reset link...
                      </>
                    ) : (
                      <>
                        <Mail size={16} />
                        Send Reset Link
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={switchToLogin}
                      className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
                    >
                      Remember your password? <span className="font-bold text-emerald-600">Sign in</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ================= SIGN IN VIEW ================= */
            <div>
              <div className="mb-8">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-emerald-600 transition mb-6"
                >
                  <ArrowLeft size={15} />
                  Back to Home
                </Link>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back</h1>
                <p className="mt-2 text-slate-500 text-sm">Sign in to your account to continue learning.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={switchToForgot}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-500" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm shadow-emerald-500/25 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn size={16} />
                      Sign In
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500 font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
                  Create one free
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;