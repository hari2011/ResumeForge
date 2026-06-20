"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ROLE_CATEGORIES } from "@/data/bullet-suggestions";

interface SuggestionsResponse {
  suggestions: string[];
  role: string;
  source?: string;
}

const ALL_CATEGORIES = ["All", ...Object.keys(ROLE_CATEGORIES)] as const;

export default function SuggestionsPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedRole, setSelectedRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [source, setSource] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  async function fetchSuggestions(role: string) {
    if (!role.trim()) return;
    setSelectedRole(role);
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, limit: 8 }),
      });
      const data = (await res.json()) as SuggestionsResponse;
      setSuggestions(data.suggestions ?? []);
      setSource(data.source ?? "static");
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleCustomRole() {
    const v = customRole.trim();
    if (v) { fetchSuggestions(v); setCustomRole(""); }
  }

  function copyBullet(text: string, idx: number) {
    navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  function copyAll() {
    navigator.clipboard.writeText(suggestions.join("\n"));
    setCopied(-1);
    setTimeout(() => setCopied(null), 2000);
  }

  const visibleRoles = activeCategory === "All"
    ? Object.values(ROLE_CATEGORIES).flat()
    : ROLE_CATEGORIES[activeCategory as keyof typeof ROLE_CATEGORIES] ?? [];

  const sourceLabel: Record<string, { label: string; color: string }> = {
    "ai+onet": { label: "AI + O*NET", color: "#0f766e" },
    "ai+static": { label: "AI Enhanced", color: "#7c3aed" },
    static: { label: "Curated", color: "#d97706" },
  };
  const src = sourceLabel[source] ?? sourceLabel["static"];

  return (
    <AppShell
      title="Bullet Point Suggestions"
      subtitle="Market-aligned achievement bullets — powered by AI, O*NET occupation data, and curated role libraries"
    >
      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Left: role picker */}
        <div className="space-y-4">
          {/* Custom role input */}
          <div className="card p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)] mb-2">Enter Any Role</p>
            <div className="flex gap-2">
              <input
                className="rf-input flex-1"
                placeholder="e.g. Blockchain Developer"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCustomRole()}
              />
              <button className="button-primary px-4 py-2 text-sm flex-shrink-0" onClick={handleCustomRole}>Go</button>
            </div>
            <p className="mt-1.5 text-[10px] text-[var(--ink-soft)]">AI generates bullets for any role not in the list</p>
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-1.5">
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  activeCategory === cat
                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                    : "bg-white border-[var(--stroke)] text-[var(--ink-soft)] hover:border-[var(--accent)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Role grid */}
          <div className="card p-3 max-h-[420px] overflow-y-auto space-y-1">
            {visibleRoles.map((role) => (
              <button
                key={role}
                onClick={() => fetchSuggestions(role)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all ${
                  selectedRole === role
                    ? "bg-[var(--accent)] text-white font-semibold"
                    : "hover:bg-[var(--panel)] text-[var(--foreground)]"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Right: bullets output */}
        <div>
          {!selectedRole && !loading ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--stroke)] py-20 text-center">
              <p className="text-4xl mb-3">✦</p>
              <p className="font-semibold text-[var(--foreground)]">Select a role or enter your own</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)] max-w-xs">AI will generate 8 market-aligned bullet points tailored to that role.</p>
            </div>
          ) : (
            <div className="card p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="font-bold text-lg text-[var(--foreground)]">{selectedRole || "…"}</p>
                  {source && (
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest mt-1"
                      style={{ color: src.color }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ backgroundColor: src.color }} />
                      {src.label}
                    </span>
                  )}
                </div>
                {suggestions.length > 0 && (
                  <button className="button-secondary px-3 py-2 text-xs" onClick={copyAll}>
                    {copied === -1 ? "✓ All Copied" : "Copy All Bullets"}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="space-y-2.5 animate-pulse">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-lg bg-[var(--stroke)]" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {suggestions.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="group flex items-start gap-3 rounded-xl border border-[var(--stroke)] bg-[var(--panel)] p-3.5 hover:border-[var(--accent)] transition-colors"
                    >
                      <span className="mt-0.5 text-[var(--accent)] font-bold flex-shrink-0">▸</span>
                      <p className="flex-1 text-sm leading-relaxed text-[var(--foreground)]">{bullet}</p>
                      <button
                        onClick={() => copyBullet(bullet, idx)}
                        className="flex-shrink-0 rounded-lg border border-[var(--stroke)] px-2.5 py-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      >
                        {copied === idx ? "✓" : "Copy"}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <div className="rounded-lg bg-[var(--panel)] border border-[var(--stroke)] px-4 py-3">
                  <p className="text-xs text-[var(--ink-soft)]">
                    <span className="font-semibold text-[var(--accent-alt)]">Tip:</span> Replace{" "}
                    <code className="rounded bg-amber-50 px-1 text-amber-700">[X]</code> placeholders with your real metrics — numbers, percentages, dollar amounts, or team sizes make bullets 3x more effective with ATS.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
