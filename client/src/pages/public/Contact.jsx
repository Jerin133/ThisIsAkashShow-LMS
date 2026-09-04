import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Mail, Phone, MapPin, Clock, CheckCircle, Send, MessageSquare, AlertCircle } from "lucide-react";

// ─── EmailJS credentials ─────────────────────────────────────────────────────
// Fill these in after setting up your EmailJS account (see setup guide below)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID";
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";
// ─────────────────────────────────────────────────────────────────────────────

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Sends directly to jj0942754@gmail.com via EmailJS — no backend needed
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name: form.name,
          from_email: form.email,
          subject: form.subject,
          message: form.message,
          reply_to: form.email,
          to_email: "jj0942754@gmail.com",
        },
        EMAILJS_PUBLIC_KEY
      );
      setSubmitted(true);
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const contactCards = [
    {
      icon: Mail,
      title: "Email Us",
      detail: "support@lmsacademy.in",
      sub: "We reply within 24 hours",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: Phone,
      title: "Call Us",
      detail: "+91 98765 43210",
      sub: "Mon–Sat, 9am–6pm IST",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: MapPin,
      title: "Location",
      detail: "Chennai, Tamil Nadu",
      sub: "India — 600001",
      color: "bg-teal-50 text-teal-600",
    },
    {
      icon: Clock,
      title: "Support Hours",
      detail: "9:00 AM – 6:00 PM",
      sub: "Monday to Saturday IST",
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero with Trading Grid */}
      <section className="bg-white border-b border-slate-200/80 relative overflow-hidden py-16 md:py-24 bg-trading-grid">
        <div className="absolute top-0 right-1/3 w-[500px] h-[300px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-6 shadow-2xs">
            <MessageSquare size={13} className="text-emerald-600" /> Get In Touch
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            We'd love to hear from you.
          </h1>
          <p className="mt-5 text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Have a question about a course, enrollment, or platform features? Reach out — our team is here to assist.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="bg-white border-b border-slate-200/80">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {contactCards.map(({ icon: Icon, title, detail, sub, color }) => (
              <div key={title} className="rounded-2xl bg-slate-50/70 border border-slate-200/80 shadow-2xs p-6 flex flex-col gap-3 hover:bg-white hover:shadow-sm transition">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
                  <p className="font-bold text-slate-900 mt-1 text-sm">{detail}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-14 items-start">
            {/* Left text */}
            <div className="md:col-span-2 space-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2.5">Send a Message</p>
                <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">How can we help you?</h2>
                <p className="mt-3.5 text-slate-600 leading-relaxed text-sm">
                  Fill out the form and our support team will get back to you within one business day.
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/70 p-6 text-slate-800 space-y-4 shadow-2xs">
                <p className="text-sm font-bold text-emerald-900">Common topics we can help with:</p>
                {[
                  "Course access or enrollment questions",
                  "Payment verification support",
                  "Technical questions regarding video playback",
                  "Bulk enrollment for universities and teams",
                  "Instructor or partnership inquiries",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2.5 text-xs text-slate-700 font-medium">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="md:col-span-3">
              {submitted ? (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 mb-5">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Message Sent!</h3>
                  <p className="mt-3 text-gray-600 text-sm leading-relaxed max-w-sm mx-auto">
                    Thank you for reaching out. Our team will review your message and get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-6 rounded-xl bg-gray-950 px-6 py-2.5 text-sm font-bold text-white hover:bg-gray-800 transition"
                  >
                    Send Another
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-100 bg-white p-8 shadow-sm space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                    <div>
                      <label htmlFor="cemail" className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                      <input
                        id="cemail"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-slate-700 mb-1.5">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      placeholder="What is this about?"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      placeholder="Describe your question or issue in detail..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                    />
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      <AlertCircle size={16} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition active:scale-[0.98] shadow-sm shadow-emerald-500/25"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;