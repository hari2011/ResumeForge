"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { resumeTemplates } from "@/data/templates";
import Link from "next/link";

const statCards = [
  { label: "Resumes Created", value: "128", delta: "+14 this week" },
  { label: "Avg ATS Score", value: "82", delta: "+6 points" },
  { label: "Interview Rate", value: "31%", delta: "+4.2%" },
  { label: "Top Skill Gap", value: "Prompt Engineering", delta: "High demand" },
];

const features = [
  { title: "Create from Scratch", desc: "Generate a professional resume with AI assistance", href: "/new-resume", icon: "📄" },
  { title: "Improve Existing", desc: "Upload and enhance your current resume", href: "/improve-resume", icon: "⭐" },
  { title: "Resume Templates", desc: "Choose from 6 professionally-designed layouts", href: "/templates", icon: "🎨" },
  { title: "Bullet Suggestions", desc: "Get role-specific achievement phrases", href: "/suggestions", icon: "💡" },
  { title: "Cover Letter", desc: "Generate matched cover letters in 30 seconds", href: "/cover-letter", icon: "📝" },
  { title: "Interview Prep", desc: "Practice with role-specific Q&A and tips", href: "/interview-prep", icon: "🎯" },
  { title: "ATS Scoring", desc: "Check resume readability for applicant systems", href: "/improve-resume", icon: "📊" },
  { title: "Market Trends", desc: "See hiring demand and salary insights", href: "/market-trends", icon: "📈" },
];

export default function DashboardPage() {
  const [lastTemplate, setLastTemplate] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setLastTemplate(localStorage.getItem("rf_last_template"));
    }
  }, []);

  const activeTemplate =
    resumeTemplates.find((t) => t.id === lastTemplate) || resumeTemplates[0];

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
