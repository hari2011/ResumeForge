import { AtsScoreResult, ExperienceLevel, ResumeSection } from "@/types/resume";

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
