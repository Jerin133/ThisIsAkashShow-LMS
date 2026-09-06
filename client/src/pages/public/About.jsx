import { Target, Users, BookOpen, Clock, Heart, Lightbulb, Award, Zap, Sparkles } from "lucide-react";

const About = () => {
  const stats = [
    { value: "2,400+", label: "Students Enrolled" },
    { value: "50+", label: "Courses Published" },
    { value: "800+", label: "Hours of Content" },
    { value: "94%", label: "Completion Rate" },
  ];

  const values = [
    {
      icon: Lightbulb,
      title: "Practical Learning",
      desc: "We focus on skills that can be directly applied in the real world — practical mastery over pure theory.",
      color: "bg-amber-50 text-amber-600 border border-amber-200/60",
    },
    {
      icon: Target,
      title: "Structured Paths",
      desc: "Every course is organized into clear modules so learners always know what comes next.",
      color: "bg-blue-50 text-blue-600 border border-blue-200/60",
    },
    {
      icon: Heart,
      title: "Student-First Design",
      desc: "Everything we build — from video players to progress analytics — is designed around the learner.",
      color: "bg-rose-50 text-rose-600 border border-rose-200/60",
    },
    {
      icon: Award,
      title: "Quality Over Quantity",
      desc: "We publish fewer courses on purpose — each one is crafted to meet the highest educational standard.",
      color: "bg-teal-50 text-teal-600 border border-teal-200/60",
    },
    {
      icon: Zap,
      title: "Fast, Secure Delivery",
      desc: "HD video streaming with built-in DRM protection for a lightning-fast, secure experience.",
      color: "bg-emerald-50 text-emerald-600 border border-emerald-200/60",
    },
    {
      icon: Users,
      title: "Active Community",
      desc: "Join thousands of driven students leveling up their technical competencies every single day.",
      color: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Light Clean Hero with Trading Grid */}
      <section className="bg-white border-b border-slate-200/80 relative overflow-hidden py-16 md:py-24 bg-trading-grid">
        <div className="absolute -top-24 left-1/3 w-[500px] h-[300px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-4xl px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200 px-4 py-1.5 text-xs font-bold text-emerald-700 mb-6 shadow-2xs">
            <Sparkles size={13} className="text-emerald-600" /> About the Academy
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Education designed for<br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent">
              real-world impact.
            </span>
          </h1>
          <p className="mt-5 text-slate-600 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            We are dedicated to building high-quality, structured courses that give learners tangible skills to excel in modern technical careers.
          </p>
        </div>
      </section>



      {/* Values */}
      <section className="py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Our Foundation</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">The principles that guide our courses</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {values.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-2xs hover:shadow-md hover:border-emerald-200/80 transition group">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color} mb-5 group-hover:scale-105 transition-transform shadow-2xs`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;