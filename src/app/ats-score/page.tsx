"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ToggleSwitch } from "@/components/toggle-switch";
import { AtsScoreResult } from "@/types/resume";

type ScoringMode = "heuristic" | "ai";

export default function AtsScorePage() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mode, setMode] = useState<ScoringMode>("heuristic");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AtsScoreResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleScore() {
    if (!resumeText.trim()) {
      setError("Please paste your resume text.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ats-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, useAi: mode === "ai" }),
      });
      if (!res.ok) throw new Error("Scoring failed");
      const data = (await res.json()) as AtsScoreResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.score >= 85
      ? "#0f766e"
      : result.score >= 70
      ? "#d97706"
      : "#dc2626"
    : "#aaa";

  return (
    <AppShell
      title="ATS Score Checker"
      subtitle="Paste your resume and a job description to get a compatibility score with keyword gap analysis."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Input panel */}
        <div className="space-y-4">

          {/* AI toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[var(--stroke)] bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">AI Enhanced Scoring</p>
              <p className="text-xs text-[var(--ink-soft)] mt-0.5">
                {mode === "ai"
                  ? "Blends keyword match + LLM semantic analysis, bullet quality & section feedback"
                  : "Fast keyword-matching — same logic real ATS systems use"}
              </p>
            </div>
            <ToggleSwitch checked={mode === "ai"} onChange={(next) => setMode(next ? "ai" : "heuristic")} className="ml-4" ariaLabel="Toggle AI scoring" />
          </div>

          <div className="rf-field">
            <label className="rf-label">Resume Text *</label>
            <p className="rf-hint">Paste your plain-text resume. PDF/DOCX? Use \"Improve Resume\" to upload a file first.</p>
            <textarea
              className="rf-textarea mt-1"
              rows={14}
              placeholder="Paste your full resume text here…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </div>
          <div className="rf-field">
            <label className="rf-label">Job Description <span className="rf-hint inline normal-case font-normal">— optional but strongly recommended</span></label>
            <textarea
              className="rf-textarea"
              rows={6}
              placeholder="Paste the target job description here. Without it, scoring uses general ATS heuristics only."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <button
            className="button-primary w-full py-3.5 text-base"
            onClick={handleScore}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {mode === "ai" ? "AI Analysing…" : "Analysing…"}
              </span>
            ) : mode === "ai" ? (
              "✦  Run AI-Enhanced ATS Check"
            ) : (
              "Run ATS Check"
            )}
          </button>
        </div>

        {/* Results panel */}
        <div>
          {!result ? (
            <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--stroke)] py-20 text-center">
              <p className="text-4xl mb-3">◎</p>
              <p className="font-semibold text-[var(--foreground)]">Your ATS report will appear here</p>
              <p className="mt-1 text-sm text-[var(--ink-soft)] max-w-xs">Paste your resume and optionally a job description, then click Run ATS Check.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Score ring */}
              <div className="card p-6 flex items-center gap-6">
                <div
                  className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full border-4 text-3xl font-black"
                  style={{ borderColor: scoreColor, color: scoreColor }}
                >
                  {result.score}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">ATS Compatibility</p>
                    {result.aiInsights ? (
                      <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">AI Enhanced</span>
                    ) : (
                      <span className="rounded-full bg-[var(--foreground)] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-widest">Heuristic</span>
                    )}
                  </div>
                  <p className="text-2xl font-black" style={{ color: scoreColor }}>
                    {result.score >= 85 ? "Excellent" : result.score >= 70 ? "Good" : result.score >= 55 ? "Fair" : "Needs Work"}
                  </p>
                  <p className="text-sm text-[var(--ink-soft)] mt-1">
                    {result.score >= 85
                      ? "Your resume is well-optimised for ATS filters."
                      : result.score >= 70
                      ? "Minor improvements will boost your pass-through rate."
                      : "Several changes needed to pass most ATS filters."}
                  </p>
                  {result.aiInsights && (
                    <p className="text-xs text-[var(--ink-soft)] mt-1">
                      Semantic score: <span className="font-bold">{result.aiInsights.semanticScore}/100</span> · Blended with keyword match
                    </p>
                  )}
                </div>
              </div>

              {/* AI Top Suggestion — shown prominently when AI mode */}
              {result.aiInsights?.topSuggestion && (
                <div className="rounded-xl border-2 border-[var(--accent)] bg-orange-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">\u2726 AI Top Priority</p>
                  <p className="text-sm font-medium text-[var(--foreground)]">{result.aiInsights.topSuggestion}</p>
                </div>
              )}

              {/* Strengths */}
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-3">Strengths</p>
                <ul className="space-y-1.5">
                  {result.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                      <span className="text-teal-600 mt-0.5">\u2713</span>{s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-rose-700 mb-3">Risks</p>
                <ul className="space-y-1.5">
                  {result.risks.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                      <span className="text-rose-500 mt-0.5">\u26a0</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI bullet quality feedback */}
              {result.aiInsights && result.aiInsights.bulletQuality.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">\u2726 AI \u00b7 Bullet Quality Feedback</p>
                  <ul className="space-y-2">
                    {result.aiInsights.bulletQuality.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                        <span className="text-purple-500 mt-0.5 font-bold">{i + 1}.</span>{b}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI section feedback */}
              {result.aiInsights && result.aiInsights.sectionFeedback.length > 0 && (
                <div className="card p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-purple-700 mb-3">\u2726 AI \u00b7 Section Feedback</p>
                  <ul className="space-y-2">
                    {result.aiInsights.sectionFeedback.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                        <span className="text-purple-500 mt-0.5">\u25b8</span>{f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing keywords */}
              {result.missingKeywords.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-2">
                    Missing Keywords ({result.missingKeywords.length})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords.map((kw) => (
                      <span key={kw} className="badge badge-amber">{kw}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-amber-700">
                    Weave these terms naturally into your experience bullets and summary to improve ATS match.
                  </p>
                </div>
              )}

              {/* Recommendations */}
              <div className="card p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent-alt)] mb-3">Recommendations</p>
                <ol className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={rec} className="flex items-start gap-2.5 text-sm text-[var(--foreground)]">
                      <span className="flex-shrink-0 font-bold text-[var(--accent)]">{i + 1}.</span>{rec}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

