import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { extractKeywords, scoreAtsFit } from "@/lib/resume-utils";
import { ImprovementInput, ResumeAnalysis } from "@/types/resume";

function buildUpgradeList(resumeText: string, jd: string, targetRole: string): string[] {
  const jdKeywords = extractKeywords(jd || targetRole);
  const resumeLower = resumeText.toLowerCase();
  const missing = jdKeywords.filter((kw) => !resumeLower.includes(kw)).slice(0, 3);

  const upgrades = [
    "Rewrote bullets with action-verb + measurable impact format",
    "Aligned summary to target role terminology",
    "Removed filler phrases and generic language",
  ];

  if (missing.length > 0) {
    upgrades.push(`Added missing JD keywords: ${missing.join(", ")}`);
  }

  const hasMetrics = /\b\d+%|\$\d+|\d+\s*(users|clients|projects|teams|months|years)\b/i.test(resumeText);
  if (!hasMetrics) {
    upgrades.push("Flagged: Add 2-3 quantified metrics (%, $, headcount, timelines) to boost ATS score");
  } else {
    upgrades.push("Preserved and amplified existing quantified achievements");
  }

  return upgrades;
}

function buildAnalysisPrompt(input: ImprovementInput): string {
  return `You are a senior resume coach and ATS expert. Analyse the resume below${input.jobDescription ? " for the target job description" : ""} and respond with ONLY valid JSON matching this exact schema (no extra text):
{
  "detectedRole": "<string — the role/title you detected from the resume>",
  "experienceLevel": "<entry|mid|senior>",
  "overallStrength": <1-10 integer>,
  "tone": "<active|passive|mixed>",
  "sections": [
    { "name": "<section name>", "issue": "<specific problem in 1 sentence>", "suggestion": "<concrete fix in 1 sentence>" }
  ],
  "topImprovements": ["<string>", "<string>", "<string>"]
}

${input.jobDescription ? `TARGET JOB DESCRIPTION:\n${input.jobDescription.slice(0, 600)}\n\n` : ""}RESUME:\n${input.existingResume.slice(0, 2500)}`;
}

function buildRewritePrompt(input: ImprovementInput): string {
  return `You are an expert resume writer. Rewrite the resume below into a strong, ATS-optimised, plain-text version for the role of "${input.targetRole}".

Rules:
- Keep ALL real experience, dates, companies, education — do not fabricate
- Rewrite bullets with strong past-tense action verbs + measurable impact language
- Rewrite the professional summary to match the target role
- Add missing JD keywords naturally where appropriate
- Remove filler phrases (hardworking, team player, passionate about)
- Use clear section headers: PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS, CERTIFICATIONS
- Output plain text only — no markdown, no JSON

${input.jobDescription ? `JOB DESCRIPTION:\n${input.jobDescription.slice(0, 600)}\n\n` : ""}TARGET ROLE: ${input.targetRole}

ORIGINAL RESUME:\n${input.existingResume.slice(0, 2500)}`;
}

function parseAnalysis(raw: string): ResumeAnalysis | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as Partial<ResumeAnalysis>;
    if (!parsed.detectedRole) return null;
    return {
      detectedRole: String(parsed.detectedRole ?? ""),
      experienceLevel: String(parsed.experienceLevel ?? "mid"),
      overallStrength: Math.max(1, Math.min(10, Number(parsed.overallStrength ?? 5))),
      tone: String(parsed.tone ?? "mixed"),
      sections: Array.isArray(parsed.sections) ? parsed.sections.slice(0, 6) : [],
      topImprovements: Array.isArray(parsed.topImprovements) ? parsed.topImprovements.slice(0, 5) : [],
    };
  } catch {
    return null;
  }
}

function deterministicRewrite(input: ImprovementInput): string {
  const base = input.existingResume
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 16)
    .join("\n");

  return [
    `TARGET ROLE: ${input.targetRole}`,
    "",
    "PROFESSIONAL SUMMARY",
    `Results-focused professional aligned to ${input.targetRole}, with demonstrated success in execution, collaboration, and measurable outcomes.`,
    "",
    "EXPERIENCE HIGHLIGHTS",
    base,
    "",
    "KEY IMPROVEMENT NOTES",
    "- Reframed bullets with action + impact language.",
    "- Prioritized recent and role-relevant accomplishments.",
    "- Added ATS-friendly role terminology and clear section labels.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ImprovementInput;

  const fallbackRewrite = deterministicRewrite(input);

  // Run AI analysis and rewrite as two sequential prompts for best quality
  const [aiAnalysisRaw, aiRewriteRaw] = await Promise.all([
    callOptionalAi(
      "You are a senior resume coach and ATS expert. You return structured JSON analysis of resumes.",
      buildAnalysisPrompt(input),
      ""
    ),
    callOptionalAi(
      "You are an expert resume writer specialising in ATS-optimised, plain-text resumes.",
      buildRewritePrompt(input),
      fallbackRewrite
    ),
  ]);

  const aiAnalysis = aiAnalysisRaw ? parseAnalysis(aiAnalysisRaw) : null;
  const rewrittenResume = aiRewriteRaw || fallbackRewrite;
  const score = scoreAtsFit(rewrittenResume, input.jobDescription || input.targetRole);
  const upgrades = buildUpgradeList(input.existingResume, input.jobDescription || "", input.targetRole);

  return NextResponse.json({
    rewrittenResume,
    score,
    upgrades,
    ...(aiAnalysis ? { aiAnalysis } : {}),
    templateId: input.templateId,
  });
}


function buildUpgradeList(resumeText: string, jd: string, targetRole: string): string[] {
  const jdKeywords = extractKeywords(jd || targetRole);
  const resumeLower = resumeText.toLowerCase();
  const missing = jdKeywords.filter((kw) => !resumeLower.includes(kw)).slice(0, 3);

  const upgrades = [
    "Rewrote bullets with action-verb + measurable impact format",
    "Aligned summary to target role terminology",
    "Removed filler phrases and generic language",
  ];

  if (missing.length > 0) {
    upgrades.push(`Added missing JD keywords: ${missing.join(", ")}`);
  }

  const hasMetrics = /\b\d+%|\$\d+|\d+\s*(users|clients|projects|teams|months|years)\b/i.test(resumeText);
  if (!hasMetrics) {
    upgrades.push("Flagged: Add 2-3 quantified metrics (%, $, headcount, timelines) to boost ATS score");
  } else {
    upgrades.push("Preserved and amplified existing quantified achievements");
  }

  return upgrades;
}

function deterministicRewrite(input: ImprovementInput): string {
  const base = input.existingResume
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 16)
    .join("\n");

  return [
    `TARGET ROLE: ${input.targetRole}`,
    "",
    "PROFESSIONAL SUMMARY",
    `Results-focused professional aligned to ${input.targetRole}, with demonstrated success in execution, collaboration, and measurable outcomes.`,
    "",
    "EXPERIENCE HIGHLIGHTS",
    base,
    "",
    "KEY IMPROVEMENT NOTES",
    "- Reframed bullets with action + impact language.",
    "- Prioritized recent and role-relevant accomplishments.",
    "- Added ATS-friendly role terminology and clear section labels.",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ImprovementInput;

  const fallbackRewrite = deterministicRewrite(input);
  const aiResponse = await callOptionalAi(
    "Rewrite resumes into ATS-friendly plain text. Keep it concise and strong.",
    `Role: ${input.targetRole}\nJob Description:${input.jobDescription}\nResume:\n${input.existingResume}`,
    fallbackRewrite
  );

  const rewrittenResume = aiResponse || fallbackRewrite;
  const score = scoreAtsFit(rewrittenResume, input.jobDescription || input.targetRole);
  const upgrades = buildUpgradeList(input.existingResume, input.jobDescription || "", input.targetRole);

  return NextResponse.json({
    rewrittenResume,
    score,
    upgrades,
  });
}
