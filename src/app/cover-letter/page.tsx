"use client";

import { FormEvent, useState } from "react";
import { AppShell } from "@/components/app-shell";

interface CoverLetterResponse {
  coverLetter: string;
}

interface CoverLetterFormData {
  candidateName: string;
  targetRole: string;
  targetCompany: string;
  yearsOfExperience: number;
  keyAchievements: string;
  tone: "professional" | "friendly" | "executive";
}

export default function CoverLetterPage() {
  const [formData, setFormData] = useState<CoverLetterFormData>({
    candidateName: "",
    targetRole: "",
    targetCompany: "",
    yearsOfExperience: 3,
    keyAchievements: "",
    tone: "professional",
  });
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Could not generate cover letter.");
      }

      const data = (await response.json()) as CoverLetterResponse;
      setCoverLetter(data.coverLetter);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function downloadCoverLetter() {
    if (!coverLetter) return;

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(coverLetter)
    );
    element.setAttribute("download", "cover-letter.txt");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <AppShell
      title="Cover Letter Generator"
      subtitle="Generate a compelling, role-tailored cover letter in seconds."
    >
      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-6">
          <h2 className="headline text-2xl">Your Details</h2>
          <form className="mt-4 grid gap-3" onSubmit={onSubmit}>
            <input
              type="text"
              placeholder="Full name"
              value={formData.candidateName}
              onChange={(e) => setFormData({ ...formData, candidateName: e.target.value })}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Target role"
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
              required
            />
            <input
              type="text"
              placeholder="Target company"
              value={formData.targetCompany}
              onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
              required
            />
            <input
              type="number"
              min={0}
              max={50}
              placeholder="Years of experience"
              value={formData.yearsOfExperience}
              onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value, 10) })}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
              required
            />
            <textarea
              rows={5}
              placeholder="Key achievements (comma-separated or brief descriptions)"
              value={formData.keyAchievements}
              onChange={(e) => setFormData({ ...formData, keyAchievements: e.target.value })}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
              required
            />
            <select
              value={formData.tone}
              onChange={(e) => setFormData({ ...formData, tone: e.target.value as "professional" | "friendly" | "executive" })}
              className="rounded-xl border border-[var(--stroke)] bg-white px-3 py-2"
            >
              <option value="professional">Professional Tone</option>
              <option value="friendly">Friendly & Approachable</option>
              <option value="executive">Executive Tone</option>
            </select>

            <button type="submit" className="button-primary rounded-xl px-4 py-3 font-semibold" disabled={loading}>
              {loading ? "Generating..." : "Generate Cover Letter"}
            </button>
            {error ? <p className="text-sm text-rose-700">{error}</p> : null}
          </form>
        </article>

        <article className="card p-6">
          <h2 className="headline text-2xl">Generated Letter</h2>
          {!coverLetter ? (
            <p className="mt-4 text-[var(--ink-soft)]">Your generated cover letter will appear here.</p>
          ) : (
            <div className="mt-4 space-y-3">
              <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl bg-[#fffdf7] p-4 text-xs text-[var(--ink-soft)]">
                {coverLetter}
              </pre>
              <button onClick={downloadCoverLetter} className="button-primary w-full rounded-lg px-3 py-2 text-sm font-semibold">
                Download as TXT
              </button>
            </div>
          )}
        </article>
      </section>
    </AppShell>
  );
}
