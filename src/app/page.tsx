import Link from "next/link";

const FEATURES = [
  { icon: "✦", title: "Guided Builder", desc: "Structured sections: Personal, Experience, Education, Skills, Projects — just like OpenResume and Reactive Resume." },
  { icon: "◎", title: "ATS Score Engine", desc: "Paste any job description and get keyword gap analysis with a real ATS compatibility score." },
  { icon: "🎨", title: "6 Pro Templates", desc: "Document-style previews: Modern, Classic, Minimal, Creative. Template applies to your PDF export." },
  { icon: "✉", title: "Cover Letter AI", desc: "Generate tone-matched cover letters in professional, friendly, or executive voice in seconds." },
  { icon: "↗", title: "Market Intelligence", desc: "Role-specific salary bands, top skills in demand, and hiring momentum signals updated by AI." },
  { icon: "⚡", title: "Free & Private", desc: "Runs on local AI (Ollama / llama.cpp). No cloud cost, no data sent to third parties." },
];

const STEPS = [
  { num: "01", label: "Pick a template", desc: "Choose from 6 designs — modern to executive." },
  { num: "02", label: "Fill structured sections", desc: "Personal info, work history, education, skills, projects." },
  { num: "03", label: "Paste the job description", desc: "AI extracts keywords and aligns your resume automatically." },
  { num: "04", label: "Generate & export", desc: "AI writes bullets and summary. Download as PDF, DOCX, or TXT." },
];

export default function Home() {
  return (
    <div className="atmosphere grid-lines min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-[var(--stroke)] bg-white/80 backdrop-blur-md px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white font-bold text-sm">RF</div>
          <span className="font-bold text-[var(--foreground)]">ResumeForge <span className="text-[var(--accent)]">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/templates" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--foreground)]">Templates</Link>
          <Link href="/market-trends" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--foreground)]">Market Trends</Link>
          <Link href="/dashboard" className="text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--foreground)]">Dashboard</Link>
          <Link href="/new-resume" className="button-primary px-4 py-2 text-sm">Build Resume →</Link>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16 rise-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--stroke)] bg-white px-4 py-1.5 text-xs font-semibold text-[var(--accent-alt)] mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-alt)] animate-pulse" />
            Free · Private · No sign-up required
          </div>
          <h1 className="headline text-5xl md:text-7xl mb-6 max-w-4xl mx-auto leading-tight">
            Build a resume that actually
            <span style={{ color: "var(--accent)" }}> gets interviews</span>
          </h1>
          <p className="text-lg text-[var(--ink-soft)] max-w-2xl mx-auto mb-8">
            Market-aligned, ATS-optimised resumes built with structured guidance, AI writing, and real job description keyword matching — inspired by the best resume builders in the world.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/new-resume" className="button-primary px-7 py-3.5 text-base">
              Build My Resume — Free
            </Link>
            <Link href="/improve-resume" className="button-secondary px-7 py-3.5 text-base">
              Improve Existing Resume
            </Link>
          </div>
        </div>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="headline text-3xl text-center mb-8">How it works</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {STEPS.map((step, i) => (
              <div key={step.num} className="card p-5 rise-in" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="text-3xl font-black" style={{ color: "var(--accent)", opacity: 0.3 }}>{step.num}</div>
                <p className="font-semibold mt-2 text-[var(--foreground)]">{step.label}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-16">
          <h2 className="headline text-3xl text-center mb-2">Everything you need</h2>
          <p className="text-center text-[var(--ink-soft)] mb-8 text-sm">Benchmarked against OpenResume, Reactive Resume, LiveCareer, and Oh My CV</p>
          <div className="grid gap-4 md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card p-5 rise-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <p className="font-semibold text-[var(--foreground)]">{f.title}</p>
                <p className="mt-1 text-sm text-[var(--ink-soft)]">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="card p-8 md:p-10 text-center">
          <h2 className="headline text-4xl mb-3">Ready to land your next role?</h2>
          <p className="text-[var(--ink-soft)] mb-6 max-w-xl mx-auto">No sign-up. No cost. Your data stays private on your machine. Start building in 30 seconds.</p>
          <Link href="/new-resume" className="button-primary inline-flex px-8 py-3.5 text-base">
            Start Building — It's Free
          </Link>
        </section>
      </main>

      <footer className="border-t border-[var(--stroke)] px-6 py-6 text-center text-xs text-[var(--ink-soft)]">
        ResumeForge AI · Free · Open · Private · Runs on Local AI
      </footer>
    </div>
  );
}
