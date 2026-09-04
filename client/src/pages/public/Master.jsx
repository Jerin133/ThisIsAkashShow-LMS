import { Link } from "react-router-dom";
import {
  BookOpen, Users, Clock, Star, Award, GraduationCap,
  CheckCircle, ArrowRight, Quote, Globe, ExternalLink
} from "lucide-react";

const Master = () => {
  const credentials = [
    "10+ Years Teaching Experience",
    "Industry Certified Educator",
    "500+ Students Mentored",
    "Curriculum Design Specialist",
    "Real-World Practitioner",
    "Published Course Author",
  ];

  const teachingPoints = [
    {
      title: "Understanding over Memorization",
      desc: "Students should grasp why concepts work, not just how to repeat them. Deep understanding leads to lasting skills.",
    },
    {
      title: "Structured Learning Paths",
      desc: "Every topic is sequenced logically — building from fundamentals to advanced application without overwhelming learners.",
    },
    {
      title: "Practice Makes Permanent",
      desc: "Each lesson includes practical exercises and real examples so students can apply knowledge immediately.",
    },
    {
      title: "Progress Without Pressure",
      desc: "Learning at your own pace is powerful. Lifetime access means you can revisit, rewatch, and review anytime.",
    },
  ];

  const stats = [
    { icon: Users, value: "2,400+", label: "Students Taught", color: "bg-blue-50 text-blue-600" },
    { icon: BookOpen, value: "50+", label: "Courses Published", color: "bg-emerald-50 text-emerald-600" },
    { icon: Clock, value: "800+", label: "Hours of Content", color: "bg-teal-50 text-teal-600" },
    { icon: Star, value: "4.9 / 5", label: "Average Rating", color: "bg-amber-50 text-amber-600" },
  ];

  const testimonials = [
    {
      name: "Rahul K.",
      quote: "The way the instructor explains complex topics is unmatched. I finally understood concepts I'd been struggling with for months.",
      course: "Introduction to NM",
    },
    {
      name: "Priya S.",
      quote: "Structured, clear, and practical. Every lesson felt like a step forward. This is the best course I've invested in.",
      course: "Advanced Module",
    },
    {
      name: "Arun M.",
      quote: "The lifetime access is a game-changer. I come back to review lessons whenever I need a refresher.",
      course: "Foundation Course",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gray-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/8 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-24">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            {/* Profile Card */}
            <div className="flex justify-center md:justify-start">
              <div className="w-full max-w-sm rounded-3xl border border-gray-800 bg-gray-900/80 p-8 backdrop-blur-sm text-center">
                {/* Avatar */}
                <div className="mx-auto h-28 w-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-4xl font-bold mb-5 shadow-lg shadow-emerald-500/25">
                  <GraduationCap size={48} />
                </div>
                <h2 className="text-2xl font-bold text-white">The Instructor</h2>
                <p className="text-emerald-400 text-sm font-semibold mt-1">Lead Educator & Course Author</p>
                <p className="text-gray-500 text-xs mt-2">LMS Academy</p>

                {/* Social */}
                <div className="flex items-center justify-center gap-3 mt-5">
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    <Globe size={16} />
                  </a>
                  <a href="#" className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition">
                    <ExternalLink size={16} />
                  </a>
                </div>

                {/* Mini stats */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-gray-800 pt-5">
                  {[["50+", "Courses"], ["2.4K+", "Students"], ["800h+", "Content"]].map(([v, l]) => (
                    <div key={l}>
                      <p className="text-base font-bold text-white">{v}</p>
                      <p className="text-[10px] text-gray-500">{l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6">
                Meet the Master Educator
              </div>
              <h1 className="text-5xl font-bold text-white leading-tight">
                Your Instructor &<br />
                <span className="text-emerald-400">Learning Guide</span>
              </h1>
              <p className="mt-6 text-gray-400 text-base leading-relaxed">
                An experienced educator focused on helping students develop practical skills and build confidence through deeply structured, real-world learning. Every course is a reflection of a decade of teaching, mentoring, and refining curriculum.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {credentials.slice(0, 4).map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium text-gray-300">
                    <Award size={11} className="text-emerald-400" /> {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 shadow-xs p-5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-900">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaching Philosophy */}
      <section className="py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Teaching Philosophy</p>
            <h2 className="text-4xl font-bold text-gray-900">How I approach teaching</h2>
            <p className="mt-4 text-gray-500 text-sm leading-relaxed">
              My goal is not to just deliver content — it's to build understanding that lasts well beyond the course.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {teachingPoints.map(({ title, desc }, i) => (
              <div key={title} className="flex gap-5 rounded-2xl border border-gray-100 bg-white p-7 shadow-xs hover:shadow-md transition">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 text-sm font-bold shrink-0">
                  {`0${i + 1}`}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credentials */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Credentials & Expertise</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Qualifications</h2>
          <div className="flex flex-wrap gap-3 justify-center">
            {credentials.map((c) => (
              <span key={c} className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:border-emerald-500 hover:text-emerald-600 transition">
                <CheckCircle size={15} className="text-emerald-500" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3">Student Feedback</p>
            <h2 className="text-4xl font-bold text-gray-900">What students say</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map(({ name, quote, course }) => (
              <div key={name} className="rounded-2xl border border-gray-100 bg-gray-50 p-7 shadow-xs">
                <Quote size={24} className="text-emerald-400 mb-4" />
                <p className="text-sm text-gray-700 leading-relaxed italic">"{quote}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-gray-200 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white text-sm font-bold shrink-0">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{course}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-20 px-6 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold text-white">Ready to learn from the best?</h2>
          <p className="mt-4 text-gray-400">Explore the full course catalog and start your structured learning journey today.</p>
          <Link
            to="/courses"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-gray-950 hover:bg-gray-100 transition"
          >
            Browse All Courses <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Master;