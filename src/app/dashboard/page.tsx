"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { resumeTemplates } from "@/data/templates";
import Link from "next/link";

interface ResumeSummary {
  id: string;
  name: string;
  templateId: string;
  createdAt: number;
  updatedAt: number;
}

const features = [
  { title: "Create from Scratch", desc: "Generate a professional resume with AI assistance", href: "/new-resume", icon: "📄" },
  { title: "Improve Existing", desc: "Upload and enhance your current resume", href: "/improve-resume", icon: "⭐" },
  { title: "Resume Templates", desc: `Choose from ${resumeTemplates.length} professionally-designed layouts`, href: "/templates", icon: "🎨" },
  { title: "Bullet Suggestions", desc: "Get role-specific achievement phrases", href: "/suggestions", icon: "💡" },
  { title: "Cover Letter", desc: "Generate matched cover letters in 30 seconds", href: "/cover-letter", icon: "📝" },
  { title: "Interview Prep", desc: "Practice with role-specific Q&A and tips", href: "/interview-prep", icon: "🎯" },
  { title: "ATS Scoring", desc: "Check resume readability for applicant systems", href: "/improve-resume", icon: "📊" },
  { title: "Market Trends", desc: "See hiring demand and salary insights", href: "/market-trends", icon: "📈" },
];

function formatRelativeTime(unixSeconds: number): string {
  const diffMs = Date.now() - unixSeconds * 1000;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

export default function DashboardPage() {
  const [lastTemplate, setLastTemplate] = useState<string | null>(null);
  const [resumes, setResumes] = useState<ResumeSummary[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLastTemplate(localStorage.getItem("rf_last_template"));
    }
    refreshResumes();
  }, []);

  async function refreshResumes() {
    setLoadingResumes(true);
    try {
      const res = await fetch("/api/resumes");
      if (res.ok) {
        const json = (await res.json()) as { resumes: ResumeSummary[] };
        setResumes(json.resumes);
      }
    } catch { /* local library unavailable — dashboard still works without it */ }
    finally { setLoadingResumes(false); }
  }

  async function duplicateResume(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "POST" });
      if (res.ok) await refreshResumes();
    } finally { setBusyId(null); }
  }

  async function deleteResume(id: string) {
    if (!window.confirm("Delete this resume from your local library? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/resumes/${id}`, { method: "DELETE" });
      if (res.ok) setResumes((cur) => cur.filter((r) => r.id !== id));
    } finally { setBusyId(null); }
  }

  const activeTemplate =
    resumeTemplates.find((t) => t.id === lastTemplate) || resumeTemplates[0];

  const statCards = [
    { label: "Saved Resumes", value: String(resumes.length), delta: "Stored locally on this device" },
    { label: "Templates Available", value: String(resumeTemplates.length), delta: "7 distinct layout engines" },
    { label: "Layout Engines", value: "7", delta: "Single, sidebar, timeline & more" },
    { label: "Account Required", value: "None", delta: "100% local, no login" },
  ];

  return (
    <AppShell
      title="Product Dashboard"
      subtitle="Your AI resume workspace with templates, suggestions, and market insights."
    >
      <section className="grid gap-4 md:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className="card p-5">
            <p className="text-sm uppercase tracking-wide text-[var(--accent-alt)]">{card.label}</p>
            <p className="mt-2 text-4xl font-semibold">{card.value}</p>
            <p className="mt-2 text-sm text-[var(--ink-soft)]">{card.delta}</p>
          </article>
        ))}
      </section>

      <section className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="headline text-2xl">My Resumes</h2>
          <Link href="/new-resume">
            <button className="button-primary rounded-lg px-4 py-2 text-sm font-semibold">+ New Resume</button>
          </Link>
        </div>
        <p className="mt-1 text-xs text-[var(--ink-soft)]">Saved to a local SQLite file on this device — nothing leaves your machine, no account needed.</p>

        {loadingResumes ? (
          <p className="mt-6 text-sm text-[var(--ink-soft)]">Loading your library…</p>
        ) : resumes.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-[var(--stroke)] p-8 text-center">
            <p className="text-sm text-[var(--ink-soft)]">No saved resumes yet. Build one, then click <strong>Save to Library</strong> to keep it here.</p>
            <Link href="/new-resume">
              <button className="button-secondary mt-4 rounded-lg px-4 py-2 text-sm font-semibold">Start Building</button>
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => {
              const tpl = resumeTemplates.find((t) => t.id === resume.templateId) || resumeTemplates[0];
              return (
                <article key={resume.id} className="rounded-xl border border-[var(--stroke)] p-4 flex flex-col gap-3" style={{ backgroundColor: tpl.colors.background }}>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: tpl.colors.accent }}>{tpl.name}</p>
                    <p className="mt-1 font-semibold text-sm truncate" style={{ color: tpl.colors.primary }}>{resume.name}</p>
                    <p className="mt-0.5 text-[10px] text-[var(--ink-soft)]">Updated {formatRelativeTime(resume.updatedAt)}</p>
                  </div>
                  <div className="mt-auto flex gap-1.5">
                    <Link href={`/new-resume?resumeId=${resume.id}`} className="flex-1">
                      <button className="button-primary w-full rounded-lg py-1.5 text-xs font-semibold">Open</button>
                    </Link>
                    <button className="button-ghost rounded-lg px-2.5 py-1.5 text-xs" disabled={busyId === resume.id} onClick={() => duplicateResume(resume.id)} title="Duplicate">⧉</button>
                    <button className="button-ghost rounded-lg px-2.5 py-1.5 text-xs text-red-600" disabled={busyId === resume.id} onClick={() => deleteResume(resume.id)} title="Delete">🗑</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="headline text-3xl">Features</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {features.map((feature) => (
              <Link key={`${feature.href}-${feature.title}`} href={feature.href}>
                <article className="card h-full p-5 transition hover:shadow-lg">
                  <p className="text-2xl">{feature.icon}</p>
                  <h3 className="mt-3 font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{feature.desc}</p>
                </article>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <section className="card p-5">
            <h2 className="headline text-xl">Your Active Template</h2>
            <div
              className="mt-3 h-32 rounded-xl border-2"
              style={{ borderColor: activeTemplate.colors.accent, backgroundColor: activeTemplate.colors.background }}
            >
              <div className="flex h-full flex-col justify-between p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: activeTemplate.colors.accent }}>
                    {activeTemplate.name}
                  </p>
                  <p className="mt-1 text-[10px]" style={{ color: activeTemplate.colors.primary, opacity: 0.6 }}>
                    {activeTemplate.category} &middot; ATS-optimized
                  </p>
                </div>
                <div className="space-y-1">
                  {["Professional Summary", "Experience", "Skills"].map((section) => (
                    <div
                      key={section}
                      className="h-2 rounded-full"
                      style={{ backgroundColor: activeTemplate.colors.primary, opacity: 0.2 }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-[var(--ink-soft)]">{activeTemplate.description}</p>
            <Link href="/new-resume">
              <button className="button-primary mt-3 w-full rounded-lg py-2 text-sm font-semibold">
                Use This Template
              </button>
            </Link>
          </section>

          <section className="card p-5">
            <h2 className="headline text-xl">All Templates <span className="text-sm font-normal text-[var(--ink-soft)]">({resumeTemplates.length})</span></h2>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {resumeTemplates.slice(0, 9).map((template) => (
                <Link key={template.id} href="/templates">
                  <div
                    className="h-14 rounded-lg border transition hover:scale-105"
                    style={{
                      backgroundColor: template.colors.background,
                      borderColor: template.colors.accent,
                    }}
                    title={template.name}
                  >
                    <div className="p-1">
                      <p className="truncate text-[8px] font-semibold" style={{ color: template.colors.accent }}>
                        {template.name}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/templates">
              <button className="button-secondary mt-3 w-full rounded-lg py-2 text-sm font-semibold">
                Browse All Templates
              </button>
            </Link>
          </section>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="headline text-2xl">Why ResumeForge?</h2>
        <div className="mt-4 grid gap-4 text-sm text-[var(--ink-soft)] md:grid-cols-3">
          <div>
            <p className="font-semibold text-[var(--foreground)]">✓ ATS-Optimized Output</p>
            <p>All templates and content are tested against real applicant tracking systems to maximize pass-through rates.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">✓ JD Keyword Alignment</p>
            <p>Paste any job description and ResumeForge automatically extracts and weaves in required keywords.</p>
          </div>
          <div>
            <p className="font-semibold text-[var(--foreground)]">✓ Market-Aligned Skills</p>
            <p>Skills, education paths, and bullet language sourced from real hiring trends per role and industry.</p>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
