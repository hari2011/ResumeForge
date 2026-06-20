import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { enhanceBullets, extractKeywords, generateSummary, scoreAtsFit } from "@/lib/resume-utils";
import { industrySkills, marketCoreSkills } from "@/data/career-options";
import { marketTrends } from "@/data/market-trends";
import { GeneratedResume, ResumeDraftInput } from "@/types/resume";

function getRoleMarketSkills(targetRole: string): string[] {
  const normalizedRole = targetRole.toLowerCase();
  const trend = marketTrends.find((item) => normalizedRole.includes(item.role.toLowerCase()));
  return trend?.topSkills ?? [];
}

function buildRecommendedSkills(input: ResumeDraftInput): string[] {
  const industry = input.industries?.split(",")[0]?.trim() || "";
  const industryMappedSkills = industrySkills[industry] ?? [];
  const roleSkills = getRoleMarketSkills(input.targetRole);

  return Array.from(
    new Set([
      ...input.skills,
      ...roleSkills,
      ...industryMappedSkills,
      ...marketCoreSkills,
      "Problem solving",
    ])
  )
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 14);
}

function buildFallbackResume(input: ResumeDraftInput): GeneratedResume {
  const summary = generateSummary(input.targetRole, input.yearsOfExperience);
  const experienceBullets = enhanceBullets(input.achievements, input.targetRole);
  const skills = buildRecommendedSkills(input);

  const jdContext = input.jobDescription
    ? input.jobDescription
    : `${input.targetRole} ${input.industries} ${skills.join(" ")}`;

  const assembledText = `${summary}\n${experienceBullets.join("\n")}\n${skills.join(" ")}`;
  const score = scoreAtsFit(assembledText, jdContext);

  return {
    summary,
    score: score.score,
    missingKeywords: score.missingKeywords,
    suggestedSkills: skills,
    sections: [
      {
        title: "Experience",
        bullets: experienceBullets,
      },
      {
        title: "Skills",
        bullets: skills.slice(0, 10),
      },
      {
        title: "Education",
        bullets: [input.education || "Add your most relevant education details."],
      },
      {
        title: "Certifications",
        bullets: [input.certifications || "List certifications aligned with your target role."],
      },
    ],
  };
}

export async function POST(request: NextRequest) {
  const input = (await request.json()) as ResumeDraftInput;

  const fallback = buildFallbackResume(input);

  const fallbackExperience = fallback.sections.find((section) => section.title === "Experience")?.bullets ?? [];

  const jdKeywords = input.jobDescription ? extractKeywords(input.jobDescription).slice(0, 12).join(", ") : "";

  const aiPrompt = [
    `Candidate: ${input.fullName}`,
    `Role: ${input.targetRole}`,
    `Years: ${input.yearsOfExperience}`,
    `Industry: ${input.industries}`,
    `Skills: ${input.skills.join(", ")}`,
    `Recommended Skills: ${fallback.suggestedSkills.join(", ")}`,
    `Education: ${input.education}`,
    `Certifications: ${input.certifications}`,
    `Achievements: ${input.achievements}`,
    jdKeywords ? `Job Description Keywords to include: ${jdKeywords}` : "",
    `Template: ${input.templateId || "modern-clean"}`,
  ].filter(Boolean).join("\n");

  const aiResponse = await callOptionalAi(
    [
      "You are an expert US-market resume writer and ATS specialist.",
      "Write concise, market-aligned content using measurable impact language.",
      "Return plain text using this exact format:",
      "SUMMARY: <2 lines>",
      "EXPERIENCE:",
      "- <bullet 1>",
      "- <bullet 2>",
      "- <bullet 3>",
      "- <bullet 4>",
      "- <bullet 5>",
      "Rules: no placeholders, no generic claims, each bullet must include outcome, scale, or metric if present in input.",
    ].join("\n"),
    aiPrompt,
    `${fallback.summary}\n${fallbackExperience.map((bullet) => `- ${bullet}`).join("\n")}`
  );

  const aiLines = aiResponse
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const summaryLine =
    aiLines.find((line) => line.toUpperCase().startsWith("SUMMARY:"))?.replace(/^SUMMARY:\s*/i, "") ||
    aiLines.find((line) => !line.startsWith("-") && !line.toUpperCase().startsWith("EXPERIENCE"));

  const bulletLines = aiLines
    .filter((line) => line.startsWith("-") || line.startsWith("•"))
    .map((line) => line.replace(/^[-•]\s*/, ""))
    .filter(Boolean)
    .slice(0, 5);

  const fallbackNonExperience = fallback.sections.filter((section) => section.title !== "Experience");

  const merged: GeneratedResume = {
    ...fallback,
    summary: summaryLine || fallback.summary,
    sections: [
      {
        title: "Experience",
        bullets: bulletLines.length > 0 ? bulletLines : fallbackExperience,
      },
      ...fallbackNonExperience,
    ],
  };

  return NextResponse.json({ resume: merged });
}
