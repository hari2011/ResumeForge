"use client";

import { useMemo } from "react";
import { scoreAtsFit } from "@/lib/resume-utils";
import { serializeResumeForm, SerializableEduEntry, SerializablePersonal, SerializableProjectEntry, SerializableWorkEntry } from "@/lib/resume-format";

interface LiveResumeScoreProps {
  personal: SerializablePersonal;
  experience: SerializableWorkEntry[];
  education: SerializableEduEntry[];
  skills: string[];
  certifications: string;
  jobDescription: string;
  projects?: SerializableProjectEntry[];
  onAddKeyword: (keyword: string) => void;
}

export function LiveResumeScore({ personal, experience, education, skills, certifications, jobDescription, projects = [], onAddKeyword }: LiveResumeScoreProps) {
  const resumeText = useMemo(
    () => serializeResumeForm(personal, experience, education, skills, certifications, projects),
    [personal, experience, education, skills, certifications, projects]
  );

  const scoreContext = jobDescription.trim() || `${personal.targetRole} ${skills.join(" ")}`;
  const result = useMemo(() => scoreAtsFit(resumeText || " ", scoreContext || " "), [resumeText, scoreContext]);

  const checklist = [
    { label: "Contact info", done: Boolean(personal.fullName && personal.email) },
    { label: "Summary", done: personal.summary.trim().length > 30 },
    { label: "Experience", done: experience.some((e) => e.company && e.description.trim().length > 10) },
    { label: "Education", done: education.some((e) => e.institution) },
    { label: "3+ Skills", done: skills.length >= 3 },
  ];

  const scoreColor = result.score >= 85 ? "#0f766e" : result.score >= 70 ? "#d97706" : "#dc2626";

  return (
    <div className="rounded-2xl border border-[var(--stroke)] bg-white p-4 shadow-sm mb-5">
      <div className="flex items-start gap-4">
        <div className="ats-score-ring flex-shrink-0" style={{ ["--pct" as string]: result.score, color: scoreColor }}>
          <span>{result.score}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-[var(--ink-soft)]">Live Resume Score</p>
            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[9px] font-bold text-teal-700 uppercase tracking-widest">Updates as you type</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {checklist.map((c) => (
              <span key={c.label} className={c.done ? "badge badge-green" : "skill-tag-neutral"}>
                {c.done ? "✓" : "○"} {c.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {jobDescription.trim().length > 0 && result.missingKeywords.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--stroke)]">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-2">🎯 Target — add these keywords from the job description</p>
          <div className="flex flex-wrap gap-1.5">
            {result.missingKeywords.slice(0, 10).map((kw) => (
              <button key={kw} type="button" onClick={() => onAddKeyword(kw)} className="badge badge-amber hover:bg-amber-200 transition-colors cursor-pointer">
                + {kw}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
