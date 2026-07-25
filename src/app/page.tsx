import Link from "next/link";
import { resumeTemplates } from "@/data/templates";

const STATS = [
  { value: "ATS-Ready", label: "All templates pass ATS parsers" },
  { value: "AI-Powered", label: "Local & cloud AI supported" },
  { value: `${resumeTemplates.length} Templates`, label: "Professional designs" },
  { value: "100% Free", label: "No paywall, no sign-up" },
];

const FEATURES = [
  {
    icon: "✦",
    title: "Smart Resume Builder",
    desc: "Structured form — Personal Info, Work Experience, Education, Skills, Projects, Certifications. Live preview as you type.",
    badge: "Popular",
    href: "/new-resume",
    cta: "Start Building",
  },
  {
    icon: "◎",
    title: "AI Resume Improver",
    desc: "Upload your existing resume. AI reads every section, populates an editable form, and rewrites it with better language and keywords.",
    badge: "AI-Enhanced",
    href: "/improve-resume",
    cta: "Improve Resume",
  },
  {
    icon: "📊",
    title: "ATS Score Checker",
    desc: "Paste a job description and get your keyword match score, gap analysis, and actionable fixes to beat the bots.",
    href: "/ats-score",
    cta: "Check Score",
  },
  {
    icon: "⚡",
    title: "Bullet Suggestions",
    desc: "35 roles, 8 market-aligned bullet points each. O*NET integrated. AI generates role-specific achievement statements on demand.",
    href: "/suggestions",
    cta: "Get Bullets",
  },
  {
    icon: "✉",
    title: "Cover Letter Generator",
    desc: "Paste a job description and generate a tone-matched cover letter in professional, friendly, or executive voice in seconds.",
    href: "/cover-letter",
    cta: "Write Letter",
  },
  {
    icon: "↗",
    title: "Market Intelligence",
    desc: "Role-specific salary bands, top skills in demand, and hiring momentum signals — updated by AI from live market data.",
    href: "/market-trends",
    cta: "See Trends",
  },
];

const HOW_IT_WORKS = [
  { num: "01", title: "Upload or start fresh", desc: "Upload your existing resume (PDF/DOCX/TXT) or start from a blank structured form." },
  { num: "02", title: "Fill your details", desc: "Accordion sections guide you through every field. AI pre-populates from your upload." },
  { num: "03", title: "Paste the job description", desc: "AI extracts keywords and aligns your resume to the exact role." },
  { num: "04", title: "Enhance & download", desc: "AI rewrites weak bullets into measurable achievements. Export as PDF or copy as text." },
];

const TEMPLATE_PREVIEWS = [
  { name: "Modern Clean", primary: "#1b1f23", accent: "#f26722", bg: "#fff" },
  { name: "Classic Pro", primary: "#1a3a5c", accent: "#c9a84c", bg: "#fafaf8" },
  { name: "Minimal Tech", primary: "#2c2c2c", accent: "#0f766e", bg: "#fff" },
  { name: "Creative Bold", primary: "#7c3aed", accent: "#f59e0b", bg: "#faf5ff" },
  { name: "Executive", primary: "#0f172a", accent: "#8b5cf6", bg: "#f8fafc" },
  { name: "Startup Vibrant", primary: "#dc2626", accent: "#2563eb", bg: "#fff" },
];

const COMPARISONS = [
  ["Live AI-powered resume editor", true, false],
  ["Upload & parse existing resume", true, false],
  ["ATS keyword gap analysis", true, "paid"],
  ["35+ role-specific bullet suggestions", true, false],
  ["Local AI (fully private, no tracking)", true, false],
  ["Cover letter generator", true, "paid"],
  ["Market salary & skills intelligence", true, false],
  ["No sign-up required", true, false],
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── Topnav ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-0">
        <div className="mx-auto max-w-7xl flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f26722] text-white font-bold text-sm shadow-sm">RF</div>
            <div className="leading-tight">
              <span className="text-base font-bold text-gray-900">ResumeForge</span>
              <span className="text-base font-bold text-[#f26722]"> AI</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/templates" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">Templates</Link>
            <Link href="/ats-score" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">ATS Score</Link>
            <Link href="/market-trends" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">Market Trends</Link>
            <Link href="/suggestions" className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-colors">Bullet Tips</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/improve-resume" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-[#f26722] border border-[#f26722] rounded-lg hover:bg-orange-50 transition-colors">Improve Existing</Link>
            <Link href="/new-resume" className="inline-flex px-4 py-2 text-sm font-bold text-white bg-[#f26722] rounded-lg hover:bg-[#e05a18] shadow-sm transition-colors">Build Resume →</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1b1f23] via-[#2a2f35] to-[#1b1f23] px-6 py-20 md:py-28">
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#f26722] opacity-10 blur-3xl" />
          <div className="absolute -right-20 top-10 h-80 w-80 rounded-full bg-[#0f766e] opacity-10 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-64 w-[600px] rounded-full bg-[#f26722] opacity-5 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-orange-300 mb-8 backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
            Free · Private · No sign-up required
          </div>

          <h1 className="headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            Build a resume that<br />
            <span className="text-[#f26722]">actually gets interviews</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            AI-powered resume builder with ATS keyword analysis, structured editing, and market-aligned bullet suggestions. Upload an existing resume or start fresh — results in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-12">
            <Link href="/new-resume" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#f26722] rounded-xl hover:bg-[#e05a18] shadow-lg shadow-orange-900/30 transition-all hover:-translate-y-0.5">
              ✦  Build New Resume — Free
            </Link>
            <Link href="/improve-resume" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/20 rounded-xl hover:bg-white/8 backdrop-blur-sm transition-all hover:-translate-y-0.5">
              📄  Upload & Improve Existing
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {STATS.map((s) => (
              <div key={s.value} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <p className="text-base font-bold text-white">{s.value}</p>
                <p className="text-[11px] text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Template Showcase ───────────────────────────────── */}
      <section className="bg-gray-50 border-b border-gray-100 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="headline text-3xl font-bold text-gray-900 mb-2"> {resumeTemplates.length}  Professional Templates</h2>
            <p className="text-gray-500 text-sm">ATS-friendly designs from Modern to Executive — each fully customisable</p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {TEMPLATE_PREVIEWS.map((t) => (
              <Link key={t.name} href="/templates" className="group block rounded-xl border-2 border-transparent hover:border-[#f26722] overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="h-20 p-2.5 flex flex-col gap-1" style={{ backgroundColor: t.bg }}>
                  <div className="h-2 rounded w-3/4" style={{ backgroundColor: t.primary }} />
                  <div className="h-1.5 rounded w-1/2" style={{ backgroundColor: t.accent }} />
                  <div className="h-1 rounded w-full bg-gray-200 mt-0.5" />
                  <div className="h-1 rounded w-4/5 bg-gray-200" />
                  <div className="h-1 rounded w-3/4 bg-gray-200" />
                </div>
                <div className="px-2 py-1.5 border-t border-gray-100">
                  <p className="text-[9px] font-bold text-gray-700 truncate">{t.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/templates" className="text-sm font-semibold text-[#f26722] hover:underline">Browse all templates →</Link>
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────── */}
      <section className="px-6 py-16 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="headline text-3xl font-bold text-gray-900 mb-2">From upload to job-ready in 4 steps</h2>
            <p className="text-gray-500 text-sm">AI does the heavy lifting — you focus on what makes you unique</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.num} className="relative text-center">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-[calc(50%+28px)] right-[-calc(50%-28px)] h-px border-t-2 border-dashed border-gray-200" />
                )}
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 border-2 border-orange-100">
                  <span className="text-xl font-black text-[#f26722]">{step.num}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Grid ────────────────────────────────────── */}
      <section className="px-6 py-16 bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="headline text-3xl font-bold text-gray-900 mb-2">Everything in one place</h2>
            <p className="text-gray-500 text-sm">No separate tools — resume builder, improver, ATS checker, bullet generator, and market insights all integrated</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:border-[#f26722]/30 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-2xl">{f.icon}</div>
                  {f.badge && (
                    <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-[#f26722] uppercase tracking-wide">{f.badge}</span>
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">{f.desc}</p>
                <Link href={f.href} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#f26722] group-hover:gap-2.5 transition-all">
                  {f.cta} <span>→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ─────────────────────────────────── */}
      <section className="px-6 py-16 bg-white border-b border-gray-100">
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="headline text-3xl font-bold text-gray-900 mb-2">Why ResumeForge AI?</h2>
            <p className="text-gray-500 text-sm">Every premium feature, completely free</p>
          </div>
          <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-5 py-3">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest col-span-1">Feature</p>
              <p className="text-xs font-bold text-[#f26722] uppercase tracking-widest text-center">ResumeForge AI</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Competitors</p>
            </div>
            {COMPARISONS.map(([feature, ours, theirs], i) => (
              <div key={String(feature)} className={`grid grid-cols-3 px-5 py-3.5 items-center ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                <p className="text-sm text-gray-700 col-span-1">{feature}</p>
                <div className="flex justify-center">
                  {ours === true ? <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">✓</span> : <span className="text-gray-400 text-xs">—</span>}
                </div>
                <div className="flex justify-center">
                  {theirs === false ? (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-400 text-xs font-bold">✗</span>
                  ) : theirs === "paid" ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-600">Paid</span>
                  ) : (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 text-xs font-bold">✓</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────── */}
      <section className="px-6 py-20 bg-gradient-to-br from-[#1b1f23] to-[#2c3440] text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="headline text-3xl md:text-4xl font-bold mb-4">Ready to land your next role?</h2>
          <p className="text-white/60 mb-8 text-base">No sign-up. No paywalls. Your data stays private on your machine. Start in 30 seconds.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/new-resume" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-[#f26722] rounded-xl hover:bg-[#e05a18] shadow-lg shadow-orange-900/30 transition-all hover:-translate-y-0.5">
              ✦  Build New Resume — Free
            </Link>
            <Link href="/improve-resume" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-white border border-white/20 rounded-xl hover:bg-white/8 transition-all hover:-translate-y-0.5">
              📄  Upload & Improve Existing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#1b1f23] border-t border-white/5 px-6 py-10">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#f26722] text-white font-bold text-sm">RF</div>
            <span className="text-sm font-bold text-white">ResumeForge AI</span>
            <span className="text-sm text-white/30">· Free · Open · Private</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-white/40">
            <Link href="/new-resume" className="hover:text-white/70 transition-colors">Builder</Link>
            <Link href="/improve-resume" className="hover:text-white/70 transition-colors">Improve</Link>
            <Link href="/templates" className="hover:text-white/70 transition-colors">Templates</Link>
            <Link href="/ats-score" className="hover:text-white/70 transition-colors">ATS Score</Link>
            <Link href="/suggestions" className="hover:text-white/70 transition-colors">Bullets</Link>
            <Link href="/market-trends" className="hover:text-white/70 transition-colors">Market Trends</Link>
          </div>
          <p className="text-xs text-white/25">© 2026 ResumeForge AI. Runs on local AI — no data sent to third parties.</p>
        </div>
      </footer>

    </div>
  );
}
