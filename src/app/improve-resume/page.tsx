"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AtsScoreResult } from "@/types/resume";

interface ImproveResponse {
  rewrittenResume: string;
  score: AtsScoreResult;
  upgrades: string[];
}

interface ParseResponse {
  resumeText: string;
}

export default function ImproveResumePage() {
  const [loading, setLoading] = useState(false);
  const [parsingFile, setParsingFile] = useState(false);
  const [result, setResult] = useState<ImproveResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState("");

  async function onFileUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setParsingFile(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as ParseResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error || "Could not parse uploaded file.");
      }

      setResumeText(data.resumeText || "");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not parse uploaded file.");
    } finally {
      setParsingFile(false);
      event.target.value = "";
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      existingResume: resumeText,
      targetRole: String(formData.get("targetRole") || ""),
      jobDescription: String(formData.get("jobDescription") || ""),
    };

    try {
      const response = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not improve resume.");
      }

      const data = (await response.json()) as ImproveResponse;
      setResult(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="Improve Existing Resume"
      subtitle="Paste your current resume and receive a stronger, ATS-tuned version."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-6">
          <h2 className="headline text-2xl">Upload / Paste</h2>
          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <input
              name="targetRole"
              required
              placeholder="Target role"
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
            />
            <textarea
              name="jobDescription"
              rows={5}
              placeholder="Paste job description for better keyword alignment"
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
            />
            <label className="text-sm font-medium text-[var(--ink-soft)]">
              Upload existing resume (PDF, DOCX, TXT)
            </label>
            <input
              type="file"
              accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onFileUpload}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
            />
            {parsingFile ? (
              <p className="text-sm text-[var(--ink-soft)]">Extracting text from uploaded file...</p>
            ) : null}
            <textarea
              name="existingResume"
              rows={12}
              required
              value={resumeText}
              onChange={(event) => setResumeText(event.target.value)}
              placeholder="Paste existing resume text"
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
            />
            <button
              type="submit"
              className="button-primary rounded-xl px-4 py-3 font-semibold"
              disabled={loading || parsingFile}
            >
              {loading ? "Improving..." : "Enhance Resume"}
            </button>
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          </form>
        </article>

        <article className="card p-6">
          <h2 className="headline text-2xl">Enhanced Version</h2>
          {!result ? (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[var(--stroke)] py-16 text-center">
              <p className="text-3xl">⭐</p>
              <p className="text-[var(--ink-soft)]">Your improved resume will appear here.</p>
              <p className="text-xs text-[var(--ink-soft)]">Upload or paste a resume, then click Enhance Resume.</p>
            </div>
          ) : (
            <div className="mt-4 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-[var(--panel)] p-4 text-center">
                  <p className="text-xs uppercase tracking-wide text-[var(--accent-alt)]">ATS Score</p>
                  <p className="mt-1 text-3xl font-bold text-teal-700">{result.score.score}</p>
                </div>
                <div className="rounded-xl bg-[var(--panel)] p-4">
                  <p className="text-xs uppercase tracking-wide text-[var(--accent-alt)]">Strengths</p>
                  <ul className="mt-1 space-y-0.5">
                    {result.score.strengths.slice(0, 2).map((s) => (
                      <li key={s} className="text-xs text-[var(--ink-soft)]">✓ {s}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {result.score.missingKeywords.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Missing JD Keywords</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.score.missingKeywords.map((kw) => (
                      <span key={kw} className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-amber-700">Add these terms naturally to your experience bullets to improve ATS match.</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-[var(--accent-alt)]">Upgrades Applied</p>
                <ul className="mt-2 space-y-1">
                  {result.upgrades.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[var(--ink-soft)]">
                      <span className="text-teal-600">✓</span>{item}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--accent-alt)]">Rewritten Resume</p>
                  <button
                    type="button"
                    className="rounded-lg border border-[var(--stroke)] px-3 py-1 text-xs font-medium hover:bg-[var(--panel)]"
                    onClick={() => navigator.clipboard.writeText(result.rewrittenResume)}
                  >
                    Copy
                  </button>
                </div>
                <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-[#fffdf7] p-4 text-sm text-[var(--ink-soft)]">
                  {result.rewrittenResume}
                </pre>
              </div>

              {result.score.recommendations.length > 0 && (
                <div className="rounded-xl border border-[var(--stroke)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent-alt)]">Next Steps</p>
                  <ul className="mt-2 space-y-1">
                    {result.score.recommendations.map((rec) => (
                      <li key={rec} className="flex items-start gap-2 text-xs text-[var(--ink-soft)]">
                        <span className="text-[var(--accent)]">→</span>{rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}
