"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { resumeTemplates, templateCategories } from "@/data/templates";

const CATEGORIES = templateCategories;
type Category = typeof CATEGORIES[number];

function DocPreview({ template, selected }: { template: typeof resumeTemplates[0]; selected: boolean }) {
  const { colors, layout } = template;
  const wrapperStyle = { backgroundColor: colors.background, aspectRatio: "8.5/11", fontFamily: "Georgia, serif" } as const;
  const wrapperClass = `relative overflow-hidden rounded-lg border-2 transition-all duration-200 ${selected ? "border-[var(--accent)] shadow-lg" : "border-transparent"}`;

  const selectedBadge = selected && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
      <div className="rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-white shadow-lg">Selected ✓</div>
    </div>
  );

  const skillsRow = (
    <div className="flex flex-wrap gap-1">
      {[4, 5, 3, 6, 4].map((w, i) => (
        <div key={i} className="h-1.5 rounded-sm" style={{ width: `${w * 6}px`, backgroundColor: colors.accent, opacity: 0.35 }} />
      ))}
    </div>
  );

  const experienceRows = (dim = false) => [1, 2].map((i) => (
    <div key={i} className="mb-2">
      <div className="flex justify-between mb-0.5">
        <div className="h-1 w-1/3 rounded-sm" style={{ backgroundColor: colors.primary, opacity: dim ? 0.6 : 0.7 }} />
        <div className="h-1 w-1/5 rounded-sm" style={{ backgroundColor: colors.accent, opacity: 0.6 }} />
      </div>
      <div className="h-0.5 w-1/4 rounded-sm mb-1" style={{ backgroundColor: colors.accent, opacity: 0.4 }} />
      <div className="space-y-0.5">
        <div className="h-0.5 w-full rounded-sm opacity-25" style={{ backgroundColor: colors.primary }} />
        <div className="h-0.5 w-11/12 rounded-sm opacity-20" style={{ backgroundColor: colors.primary }} />
      </div>
    </div>
  ));

  if (layout === "sidebar") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="px-4 py-3" style={{ backgroundColor: colors.primary }}>
          <div className="h-2.5 w-3/5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
          <div className="mt-1.5 h-1.5 w-2/5 rounded-sm" style={{ backgroundColor: colors.accent }} />
        </div>
        <div className="flex" style={{ minHeight: "60%" }}>
          <div className="w-2/5 px-3 py-3 space-y-2.5" style={{ backgroundColor: `${colors.primary}0d` }}>
            <div><div className="h-1.5 w-4/5 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />{skillsRow}</div>
            <div><div className="h-1.5 w-4/5 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} /><div className="h-0.5 w-full rounded-sm opacity-30 mb-1" style={{ backgroundColor: colors.primary }} /><div className="h-0.5 w-4/5 rounded-sm opacity-25" style={{ backgroundColor: colors.primary }} /></div>
          </div>
          <div className="flex-1 px-4 py-3 space-y-3">
            <div><div className="h-1.5 w-2/3 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} /><div className="h-1 w-full rounded-sm opacity-40 mb-1" style={{ backgroundColor: colors.primary }} /><div className="h-1 w-4/5 rounded-sm opacity-30" style={{ backgroundColor: colors.primary }} /></div>
            <div><div className="h-1.5 w-1/2 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />{experienceRows()}</div>
          </div>
        </div>
        {selectedBadge}
      </div>
    );
  }

  if (layout === "compact") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="px-4 py-3" style={{ borderBottom: `2px solid ${colors.accent}` }}>
          <div className="h-2.5 w-3/5 rounded-sm" style={{ backgroundColor: colors.primary }} />
          <div className="mt-1.5 h-1.5 w-2/5 rounded-sm" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
        </div>
        <div className="px-4 py-3 space-y-2.5">
          <div><div className="h-1 w-24 rounded-sm mb-1 border-b" style={{ borderColor: colors.accent, color: colors.primary }} /><div className="h-1 w-full rounded-sm opacity-40 mb-1" style={{ backgroundColor: colors.primary }} /><div className="h-1 w-4/5 rounded-sm opacity-30" style={{ backgroundColor: colors.primary }} /></div>
          <div><div className="h-1 w-20 rounded-sm mb-1" style={{ backgroundColor: colors.primary, opacity: 0.6 }} />{experienceRows(true)}</div>
          <div><div className="h-1 w-12 rounded-sm mb-1" style={{ backgroundColor: colors.primary, opacity: 0.6 }} />{skillsRow}</div>
        </div>
        {selectedBadge}
      </div>
    );
  }

  if (layout === "timeline") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="px-4 py-3" style={{ borderBottom: `2px solid ${colors.accent}` }}>
          <div className="h-2.5 w-3/5 rounded-sm" style={{ backgroundColor: colors.accent }} />
          <div className="mt-1.5 h-1.5 w-2/5 rounded-sm" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
        </div>
        <div className="px-4 py-3 space-y-3">
          <div><div className="h-1.5 w-24 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} /><div className="h-1 w-full rounded-sm opacity-40 mb-1" style={{ backgroundColor: colors.primary }} /><div className="h-1 w-4/5 rounded-sm opacity-30" style={{ backgroundColor: colors.primary }} /></div>
          <div className="flex gap-2">
            <div className="w-px" style={{ backgroundColor: colors.accent, opacity: 0.5 }} />
            <div className="flex-1 space-y-2">{experienceRows()}</div>
          </div>
          <div>{skillsRow}</div>
        </div>
        {selectedBadge}
      </div>
    );
  }

  if (layout === "header-centered") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="px-4 py-4 flex flex-col items-center text-center">
          <div className="h-2.5 w-1/2 rounded-sm" style={{ backgroundColor: colors.primary }} />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-sm" style={{ backgroundColor: colors.accent }} />
          <div className="mt-2 h-px w-4/5" style={{ backgroundColor: colors.primary, opacity: 0.5 }} />
        </div>
        <div className="px-4 py-2 space-y-2.5">
          <div><div className="h-1 w-24 rounded-sm mb-1" style={{ backgroundColor: colors.primary, opacity: 0.6 }} /><div className="h-1 w-full rounded-sm opacity-40 mb-1" style={{ backgroundColor: colors.primary }} /><div className="h-1 w-4/5 rounded-sm opacity-30" style={{ backgroundColor: colors.primary }} /></div>
          <div><div className="h-1 w-20 rounded-sm mb-1" style={{ backgroundColor: colors.primary, opacity: 0.6 }} />{experienceRows(true)}</div>
        </div>
        {selectedBadge}
      </div>
    );
  }

  if (layout === "banner-sidebar") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="flex h-full">
          <div className="w-2/5 px-3 py-3 space-y-2.5" style={{ backgroundColor: `${colors.primary}0d` }}>
            <div className="h-6 w-6 rounded-full mx-auto mb-2" style={{ backgroundColor: colors.accent, opacity: 0.4 }} />
            <div><div className="h-1.5 w-4/5 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />{skillsRow}</div>
            <div><div className="h-1.5 w-4/5 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} /><div className="h-0.5 w-full rounded-sm opacity-30 mb-1" style={{ backgroundColor: colors.primary }} /><div className="h-0.5 w-4/5 rounded-sm opacity-25" style={{ backgroundColor: colors.primary }} /></div>
          </div>
          <div className="flex-1 px-3 py-3 space-y-3">
            <div className="rounded-md px-2.5 py-2" style={{ backgroundColor: colors.primary }}>
              <div className="h-2 w-3/4 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
              <div className="mt-1 h-1 w-1/2 rounded-sm" style={{ backgroundColor: colors.accent }} />
            </div>
            <div><div className="h-1.5 w-1/2 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />{experienceRows()}</div>
          </div>
        </div>
        {selectedBadge}
      </div>
    );
  }

  if (layout === "label-rows") {
    return (
      <div className={wrapperClass} style={wrapperStyle}>
        <div className="px-4 py-4 flex flex-col items-center text-center" style={{ borderBottom: `2px solid ${colors.primary}` }}>
          <div className="h-2.5 w-1/2 rounded-sm" style={{ backgroundColor: colors.primary }} />
          <div className="mt-1.5 h-1.5 w-1/3 rounded-sm" style={{ backgroundColor: colors.accent }} />
        </div>
        <div className="px-4 py-3 space-y-0">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex gap-3 py-2" style={{ borderTop: i > 0 ? `1px solid ${colors.primary}22` : undefined }}>
              <div className="h-1 w-1/4 rounded-sm flex-shrink-0" style={{ backgroundColor: colors.accent, opacity: i === 0 ? 1 : 0.6 }} />
              <div className="flex-1 space-y-1">
                <div className="h-1 w-full rounded-sm opacity-40" style={{ backgroundColor: colors.primary }} />
                <div className="h-1 w-4/5 rounded-sm opacity-25" style={{ backgroundColor: colors.primary }} />
              </div>
            </div>
          ))}
        </div>
        {selectedBadge}
      </div>
    );
  }

  // single (default) — bold colored banner header
  return (
    <div className={wrapperClass} style={wrapperStyle}>
      <div className="px-4 py-3" style={{ backgroundColor: colors.primary }}>
        <div className="h-2.5 w-3/5 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.9)" }} />
        <div className="mt-1.5 h-1.5 w-2/5 rounded-sm" style={{ backgroundColor: colors.accent }} />
        <div className="mt-2 flex gap-2">
          <div className="h-1 w-16 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
          <div className="h-1 w-12 rounded-sm" style={{ backgroundColor: "rgba(255,255,255,0.5)" }} />
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        <div>
          <div className="h-1.5 w-24 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />
          <div className="space-y-1">
            <div className="h-1 w-full rounded-sm opacity-40" style={{ backgroundColor: colors.primary }} />
            <div className="h-1 w-4/5 rounded-sm opacity-30" style={{ backgroundColor: colors.primary }} />
          </div>
        </div>
        <div>
          <div className="h-1.5 w-20 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />
          {experienceRows()}
        </div>
        <div>
          <div className="h-1.5 w-12 rounded-sm mb-1.5" style={{ backgroundColor: colors.accent }} />
          {skillsRow}
        </div>
      </div>
      {selectedBadge}
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
    <AppShell title="Resume Templates" subtitle={`${resumeTemplates.length} ATS-safe templates — pick a design, then build your resume`}>
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

              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="badge" style={{ backgroundColor: `${template.colors.accent}18`, color: template.colors.accent }}>
                  {template.category}
                </span>
                <span className="badge" style={{ backgroundColor: "#eef2ff", color: "#4338ca" }}>
                  {template.layout === "header-centered" ? "centered" : template.layout}
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
