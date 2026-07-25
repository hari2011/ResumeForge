import { AtsScoreResult, ExperienceLevel, ProofreadIssue, ProofreadResult, ResumeSection } from "@/types/resume";

const COMMON_FILLER_WORDS = ["hardworking", "team player", "responsible", "passionate"];

export function inferExperienceLevel(years: number): ExperienceLevel {
  if (years < 3) {
    return "entry";
  }

  if (years < 8) {
    return "mid";
  }

  return "senior";
}

export function extractKeywords(text: string): string[] {
  // Preserve tech keywords like C++, C#, .NET before stripping punctuation
  const techPattern = /\b(c\+\+|c#|\.net|node\.js|next\.js|vue\.js|react\.js|asp\.net|f#)\b/gi;
  const techMatches = Array.from(text.matchAll(techPattern), (m) => m[0].toLowerCase());

  const general = Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((token) => token.length >= 2)
    )
  );

  return Array.from(new Set([...techMatches, ...general])).slice(0, 40);
}

export function parseResumeIntoSections(resume: string): ResumeSection[] {
  const sectionBlocks = resume
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (sectionBlocks.length < 2) {
    return [
      {
        title: "Experience Highlights",
        bullets: resume
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .slice(0, 6),
      },
    ];
  }

  return sectionBlocks.slice(0, 5).map((block) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const titleLine = lines[0] ?? "Section";

    return {
      title: titleLine.replace(/[:\-]$/, ""),
      bullets: lines.slice(1).map((line) => line.replace(/^[-*•]\s*/, "")).slice(0, 6),
    };
  });
}

export function scoreAtsFit(resumeText: string, jobDescription: string): AtsScoreResult {
  const normalizedResume = resumeText.toLowerCase();
  const keywords = extractKeywords(jobDescription);

  const matchedKeywords = keywords.filter((keyword) => normalizedResume.includes(keyword));
  const missingKeywords = keywords.filter((keyword) => !normalizedResume.includes(keyword)).slice(0, 10);

  const hasMetrics = /\b\d+%|\$\d+|\d+\s*(users|clients|projects|teams|months|years)\b/i.test(resumeText);
  const fillerHits = COMMON_FILLER_WORDS.filter((word) => normalizedResume.includes(word));

  let score = Math.round((matchedKeywords.length / Math.max(1, keywords.length)) * 70);

  if (hasMetrics) {
    score += 15;
  }

  if (resumeText.length > 1200) {
    score += 5;
  }

  if (fillerHits.length > 0) {
    score -= Math.min(10, fillerHits.length * 3);
  }

  score = Math.max(35, Math.min(98, score));

  return {
    score,
    strengths: [
      `${matchedKeywords.length} matching role keywords identified`,
      hasMetrics ? "Quantified achievements detected" : "Add measurable impact statements",
      "Formatting appears ATS-readable in plain text",
    ],
    risks: [
      missingKeywords.length > 0 ? "Missing relevant role keywords" : "Keyword coverage is strong",
      fillerHits.length > 0 ? "Generic language detected" : "Language appears role-specific",
    ],
    missingKeywords,
    recommendations: [
      "Mirror language from the target job description in summary and experience bullets.",
      "Use action + impact format, such as 'Launched X, improved Y by Z%'.",
      "Prioritize recent and role-aligned achievements above older responsibilities.",
    ],
  };
}

export function generateSummary(role: string, years: number): string {
  const level = inferExperienceLevel(years);

  if (level === "entry") {
    return `Emerging ${role} with practical project experience and a track record of fast learning. Known for translating goals into clear execution plans and delivering measurable outcomes.`;
  }

  if (level === "mid") {
    return `Results-driven ${role} with ${years} years of experience delivering high-impact initiatives. Skilled at converting business goals into scalable execution while collaborating cross-functionally.`;
  }

  return `Strategic ${role} with ${years} years of leadership and delivery experience. Builds high-performing systems and teams that consistently exceed targets and improve operating outcomes.`;
}

export function enhanceBullets(rawAchievements: string, role: string): string[] {
  const lines = rawAchievements
    .split(/\n|\./)
    .map((line) => line.trim())
    .filter((line) => line.length > 12)
    .slice(0, 6);

  const metricPattern = /\b\d+%|\$\d+|\d+\s*(users|clients|projects|teams|months|years)\b/i;

  const normalizeWithImpact = (line: string) => {
    const normalized = line.replace(/^[-*•]\s*/, "").trim();
    if (!normalized) {
      return normalized;
    }

    if (metricPattern.test(normalized)) {
      return normalized.endsWith(".") ? normalized : `${normalized}.`;
    }

    return normalized.endsWith(".")
      ? normalized.replace(/\.$/, ", improving measurable business outcomes.")
      : `${normalized}, improving measurable business outcomes.`;
  };

  if (lines.length === 0) {
    return [
      `Delivered role-specific initiatives as a ${role}, improving execution speed and stakeholder confidence.`,
      `Introduced process improvements that raised quality and reduced cycle times.`,
      `Partnered with cross-functional teams to launch outcomes aligned with business priorities.`,
    ];
  }

  return lines.map(normalizeWithImpact);
}

/** Deterministic single-bullet improver used as a fallback for the per-bullet AI "improve" action. */
export function improveSingleBullet(rawText: string, role: string): string {
  const metricPattern = /\b\d+%|\$\d+|\d+\s*(users|clients|projects|teams|months|years)\b/i;
  const weakStarters = /^(responsible for|worked on|helped with|was involved in|did|handled)\b/i;
  const strongVerbs = ["Led", "Delivered", "Drove", "Built", "Optimized", "Launched", "Streamlined", "Spearheaded"];

  let text = rawText.replace(/^[-*•]\s*/, "").trim();
  if (!text) {
    return `Delivered measurable results as a ${role}, improving execution speed and stakeholder confidence.`;
  }

  if (weakStarters.test(text)) {
    const verb = strongVerbs[text.length % strongVerbs.length];
    text = text.replace(weakStarters, verb);
  }

  text = text.replace(/\.$/, "");

  if (!metricPattern.test(text)) {
    text = `${text}, improving measurable outcomes for the team`;
  }

  return text.endsWith(".") ? text : `${text}.`;
}

/** Deterministic heuristic proofreader — always runs as a baseline, even without AI configured. */
export function proofreadResumeHeuristic(resumeText: string): ProofreadResult {
  const issues: ProofreadIssue[] = [];
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);

  const firstPersonPattern = /\b(I|I'm|I've|my|me)\b/;
  const repeatedWordPattern = /\b(\w+)\s+\1\b/i;
  const passivePattern = /\b(was|were|been|being|is|are)\s+\w+ed\b/i;
  const weakStarters = /^(responsible for|worked on|helped with|was involved in|duties included)\b/i;

  let firstPersonHit = false;
  let passiveHits = 0;
  let weakStarterHits = 0;
  let longSentenceHits = 0;
  let hasMetric = false;
  let doubleSpaceHits = 0;

  for (const line of lines) {
    if (!firstPersonHit && firstPersonPattern.test(line)) {
      firstPersonHit = true;
      issues.push({ category: "tone", severity: "high", message: "Avoid first-person pronouns (\"I\", \"my\") — resumes read best in implied first person.", excerpt: line.slice(0, 80) });
    }
    const repeatMatch = line.match(repeatedWordPattern);
    if (repeatMatch) {
      issues.push({ category: "repetition", severity: "medium", message: `Repeated word "${repeatMatch[1]}" found back-to-back.`, excerpt: line.slice(0, 80) });
    }
    if (passivePattern.test(line)) passiveHits += 1;
    if (weakStarters.test(line)) weakStarterHits += 1;
    if (line.split(/\s+/).length > 35) longSentenceHits += 1;
    if (/\b\d+%|\$\d+|\d+\s*(users|clients|projects|teams|months|years)\b/i.test(line)) hasMetric = true;
    if (/ {2,}/.test(line)) doubleSpaceHits += 1;
  }

  if (passiveHits > 0) {
    issues.push({ category: "grammar", severity: "medium", message: `Possible passive voice detected in ${passiveHits} line${passiveHits > 1 ? "s" : ""}. Prefer active voice, e.g. "Led the team" instead of "The team was led by".` });
  }
  if (weakStarterHits > 0) {
    issues.push({ category: "clarity", severity: "medium", message: `${weakStarterHits} bullet${weakStarterHits > 1 ? "s" : ""} start with a weak phrase like "Responsible for". Start with a strong action verb instead.` });
  }
  if (longSentenceHits > 0) {
    issues.push({ category: "clarity", severity: "low", message: `${longSentenceHits} line${longSentenceHits > 1 ? "s are" : " is"} quite long (35+ words). Consider splitting into shorter, punchier bullets.` });
  }
  if (!hasMetric) {
    issues.push({ category: "clarity", severity: "low", message: "No measurable results detected. Add numbers, percentages, or scale to strengthen impact (e.g. \"reduced costs by 18%\")." });
  }
  if (doubleSpaceHits > 0) {
    issues.push({ category: "formatting", severity: "low", message: "Double spaces detected — clean up spacing for a polished, professional look." });
  }

  const fillerHits = COMMON_FILLER_WORDS.filter((word) => resumeText.toLowerCase().includes(word));
  if (fillerHits.length > 0) {
    issues.push({ category: "clarity", severity: "low", message: `Generic filler language found: ${fillerHits.join(", ")}. Replace with specific, evidence-backed strengths.` });
  }

  const severityPenalty = { high: 12, medium: 6, low: 2 } as const;
  const score = Math.max(40, Math.min(100, 100 - issues.reduce((sum, issue) => sum + severityPenalty[issue.severity], 0)));

  const verdict = issues.length === 0
    ? "Clean! No major writing issues detected."
    : issues.some((i) => i.severity === "high")
      ? "A few important issues found — fix these before applying."
      : `Mostly clean — ${issues.length} minor suggestion${issues.length > 1 ? "s" : ""} to polish.`;

  return { score, issues, verdict };
}


