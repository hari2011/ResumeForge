import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { scoreAtsFit } from "@/lib/resume-utils";
import { AtsScoreResult } from "@/types/resume";

interface AtsRequest {
  resumeText?: string;
  jobDescription?: string;
  useAi?: boolean;
}

interface AiInsights {
  semanticScore: number;
  bulletQuality: string[];
  sectionFeedback: string[];
  topSuggestion: string;
}

function buildAiPrompt(resumeText: string, jobDescription: string): string {
  return `You are an expert ATS and hiring manager. Analyse the resume below${jobDescription ? " against the job description" : ""} and respond with ONLY valid JSON matching this exact schema:
{
  "semanticScore": <0-100 integer, holistic quality score>,
  "bulletQuality": [<up to 4 short strings, each identifying a specific weak or missing bullet and how to fix it>],
  "sectionFeedback": [<up to 3 short strings, each noting a section-level improvement>],
  "topSuggestion": "<single most impactful change, one sentence>"
}

${jobDescription ? `JOB DESCRIPTION:\n${jobDescription.slice(0, 800)}\n\n` : ""}RESUME:\n${resumeText.slice(0, 2000)}`;
}

function parseAiInsights(raw: string): AiInsights | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]) as Partial<AiInsights>;
    if (typeof parsed.semanticScore !== "number") return null;
    return {
      semanticScore: Math.max(0, Math.min(100, Math.round(parsed.semanticScore))),
      bulletQuality: Array.isArray(parsed.bulletQuality) ? parsed.bulletQuality.slice(0, 4) : [],
      sectionFeedback: Array.isArray(parsed.sectionFeedback) ? parsed.sectionFeedback.slice(0, 3) : [],
      topSuggestion: typeof parsed.topSuggestion === "string" ? parsed.topSuggestion : "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as AtsRequest;

  if (!body.resumeText || !body.resumeText.trim()) {
    return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
  }

  // Always run heuristic scoring (fast, deterministic)
  const heuristicResult = scoreAtsFit(body.resumeText, body.jobDescription || "");

  if (!body.useAi) {
    return NextResponse.json(heuristicResult);
  }

  // AI-enhanced pass: semantic analysis in parallel (non-blocking on failure)
  const aiRaw = await callOptionalAi(
    "You are an expert ATS analyst and senior recruiter. You analyse resumes and return structured JSON feedback.",
    buildAiPrompt(body.resumeText, body.jobDescription || ""),
    ""
  );

  const aiInsights = aiRaw ? parseAiInsights(aiRaw) : null;

  // Blend scores: 60% heuristic (keyword precision) + 40% AI (semantic quality)
  const blendedScore = aiInsights
    ? Math.round(heuristicResult.score * 0.6 + aiInsights.semanticScore * 0.4)
    : heuristicResult.score;

  const result: AtsScoreResult = {
    ...heuristicResult,
    score: Math.max(35, Math.min(98, blendedScore)),
    ...(aiInsights ? { aiInsights } : {}),
  };

  return NextResponse.json(result);
}

