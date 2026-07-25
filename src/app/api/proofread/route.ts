import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { proofreadResumeHeuristic } from "@/lib/resume-utils";
import { ProofreadIssue } from "@/types/resume";

interface ProofreadPayload {
  resumeText: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ProofreadPayload;

  if (!body.resumeText?.trim()) {
    return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
  }

  const heuristic = proofreadResumeHeuristic(body.resumeText);

  const aiResponse = await callOptionalAi(
    [
      "You are a professional resume proofreader.",
      "Review the resume text and return ONLY a JSON array (max 5 items) of concise, specific improvement suggestions covering grammar, clarity, tone, or word choice.",
      "Each item must be a short string under 140 characters. Do not repeat generic advice about metrics or first-person pronouns — focus on things specific to THIS text.",
      "Return ONLY valid JSON, e.g. [\"Suggestion one\", \"Suggestion two\"]",
    ].join("\n"),
    body.resumeText.slice(0, 3500),
    "[]"
  );

  let aiIssues: ProofreadIssue[] = [];
  try {
    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as unknown[];
      aiIssues = parsed
        .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        .slice(0, 5)
        .map((message) => ({ category: "clarity" as const, severity: "low" as const, message }));
    }
  } catch {
    aiIssues = [];
  }

  const combinedIssues = [...heuristic.issues, ...aiIssues];
  const severityPenalty = { high: 12, medium: 6, low: 2 } as const;
  const score = Math.max(40, Math.min(100, 100 - combinedIssues.reduce((sum, issue) => sum + severityPenalty[issue.severity], 0)));

  return NextResponse.json({
    score,
    issues: combinedIssues,
    verdict: heuristic.verdict,
  });
}
