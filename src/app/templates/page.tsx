"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { resumeTemplates } from "@/data/templates";

const CATEGORIES = ["all", "modern", "classic", "minimal", "creative"] as const;
type Category = typeof CATEGORIES[number];

function DocPreview({ template, selected }: { template: typeof resumeTemplates[0]; selected: boolean }) {
  const { colors } = template;
  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${selected ? "border-[var(--accent)] shadow-lg" : "border-transparent"}`}
      style={{ backgroundColor: colors.background, aspectRatio: "8.5/11", fontFamily: "Georgia, serif" }}
    >
      {/* Header band */}
      <div className="px-4 py-3" style={{ backgroundColor: colors.primary }}>
        <div className="h-2.5 w-3/5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
        <div className="mt-1.5 h-1.5 w-2/5 rounded-sm" style={{ backgroundColor: colors.accent }} />
        <div className="mt-2 flex gap-2">
          <div className="h-1 w-16 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
          <div className="h-1 w-12 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>
      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Summary */}
        <div>
          <div className="h-1.5 w-24 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />
          <div className="space-y-1">
            <div className="h-1 w-full rounded-sm opacity-40" style={{ backgroundColor: colors.primary }} />
            <div className="h-1 w-4/5 rounded-sm opacity-30" style={{ backgroundColor: colors.primary }} />
          </div>
        </div>
        {/* Experience */}
        <div>
          <div className="h-1.5 w-20 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />
          {[1, 2].map((i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between mb-0.5">
                <div className="h-1 w-1/3 rounded-sm" style={{ backgroundColor: colors.primary, opacity: 0.7 }} />
                <div className="h-1 w-1/5 rounded-sm" style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
              </div>
              <div className="h-0.5 w-1/4 rounded-sm mb-1" style={{ backgroundColor: colors.accent, opacity: 0.4 }} />
              <div className="space-y-0.5">
                <div className="h-0.5 w-full rounded-sm opacity-25" style={{ backgroundColor: colors.primary }} />
                <div className="h-0.5 w-11/12 rounded-sm opacity-20" style={{ backgroundColor: colors.primary }} />
              </div>
            </div>
          ))}
        </div>
        {/* Skills */}
        <div>
          <div className="h-1.5 w-12 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />
          <div className="flex flex-wrap gap-1">
            {[4, 5, 3, 6, 4].map((w, i) => (
              <div key={i} className="h-1.5 rounded-sm" style={{ width: `${w * 6}px`, backgroundColor: colors.accent, opacity: 0.35 }} />
            ))}
          </div>
        </div>
      </div>
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10">
          <div className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white shadow-lg">Selected ✓</div>
        </div>
      )}
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    setSelected(localStorage.getItem("rf_last_template"));
  }, []);

  const filtered = activeCategory === "all" ? resumeTemplates : resumeTemplates.filter((t) => t.category === activeCategory);

  function handleUse(id: string) {
    localStorage.setItem("rf_last_template", id);
    router.push("/new-resume");
  }

  return (
    <AppShell title="Resume Templates" subtitle="Pick a design, then build your resume — template carries through to your export">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              activeCategory === cat
                ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow"
                : "bg-white border-[var(--stroke)] text-[var(--ink-soft)] hover:border-[var(--accent)]"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <article key={template.id} className="group">
            {/* Document preview */}
            <div
              className="cursor-pointer transition-transform duration-200 group-hover:-translate-y-1"
              onClick={() => setSelected(template.id)}
            >
              <DocPreview template={template} selected={selected === template.id} />
            </div>

            {/* Card footer */}
            <div className="mt-3 px-1">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{template.name}</p>
                  <p className="text-xs text-[var(--ink-soft)] mt-0.5">{template.description}</p>
                </div>
                <div className="flex items-center gap-1 ml-2 mt-0.5">
                  <span
                    className="h-4 w-4 rounded-full border border-white/60 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: template.colors.primary }}
                  />
                  <span
                    className="h-4 w-4 rounded-full border border-white/60 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: template.colors.accent }}
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="badge" style={{ backgroundColor: `${template.colors.accent}18`, color: template.colors.accent }}>
                  {template.category}
                </span>
                <span className="badge badge-green">ATS-safe</span>
              </div>

              <button
                className="button-primary mt-3 w-full py-2.5 text-sm"
                onClick={() => handleUse(template.id)}
              >
                Use This Template →
              </button>
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
