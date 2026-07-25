"use client";

import { useState } from "react";
import { ProofreadResult } from "@/types/resume";

const CATEGORY_ICON: Record<string, string> = {
  grammar: "📝",
  clarity: "💡",
  tone: "🗣",
  repetition: "🔁",
  formatting: "🧹",
};

const SEVERITY_COLOR: Record<string, string> = {
  high: "#dc2626",
  medium: "#d97706",
  low: "#0f766e",
};

export function ProofreadPanel({ resumeText }: { resumeText: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runProofread() {
    setOpen(true);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proofread", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeText }) });
      if (!res.ok) throw new Error("Proofread failed.");
      const data = (await res.json()) as ProofreadResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result ? (result.score >= 85 ? "#0f766e" : result.score >= 65 ? "#d97706" : "#dc2626") : "#aaa";

  return (
    <>
      <button className="button-ghost px-3 py-1.5 text-xs" onClick={runProofread} disabled={!resumeText.trim()}>
        🔍 Proofread
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-lg max-h-[80vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4 sticky top-0 bg-white z-10">
              <p className="text-sm font-bold text-[var(--foreground)]">🔍 Proofreading Report</p>
              <button className="button-ghost px-2 py-1 text-xs" onClick={() => setOpen(false)}>✕ Close</button>
            </div>

            <div className="p-5 space-y-4">
              {loading && (
                <div className="flex flex-col items-center justify-center gap-3 py-10">
                  <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                  <p className="text-sm text-[var(--ink-soft)]">Scanning grammar, tone, and clarity…</p>
                </div>
              )}

              {error && <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}

              {!loading && result && (
                <>
                  <div className="flex items-center gap-4 rounded-xl border border-[var(--stroke)] bg-[#fafaf8] p-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full border-4 text-lg font-black" style={{ borderColor: scoreColor, color: scoreColor }}>
                      {result.score}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Writing Quality Score</p>
                      <p className="text-sm font-semibold text-[var(--foreground)] mt-0.5">{result.verdict}</p>
                    </div>
                  </div>

                  {result.issues.length === 0 ? (
                    <p className="text-center text-sm text-teal-700 py-6">✓ No issues found — your writing looks clean!</p>
                  ) : (
                    <div className="space-y-2.5">
                      {result.issues.map((issue, i) => (
                        <div key={i} className="rounded-xl border border-[var(--stroke)] p-3.5">
                          <div className="flex items-start gap-2.5">
                            <span className="text-base flex-shrink-0">{CATEGORY_ICON[issue.category] ?? "•"}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: SEVERITY_COLOR[issue.severity] }}>{issue.severity}</span>
                                <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--ink-soft)]">{issue.category}</span>
                              </div>
                              <p className="text-sm text-[var(--foreground)]">{issue.message}</p>
                              {issue.excerpt && <p className="text-xs text-[var(--ink-soft)] mt-1 italic">&ldquo;{issue.excerpt}…&rdquo;</p>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
