import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { improveSingleBullet } from "@/lib/resume-utils";

interface ImproveBulletPayload {
  text: string;
  targetRole?: string;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as ImproveBulletPayload;

  if (!body.text?.trim()) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  const role = body.targetRole?.trim() || "professional";
  const fallback = body.text
    .split(/\n+/)
    .map((line) => improveSingleBullet(line, role))
    .join("\n");

  const aiResponse = await callOptionalAi(
    [
      "You are an expert resume writer.",
      "Rewrite the candidate's raw achievement text into 1-3 sharp, achievement-focused resume bullet lines.",
      "Rules: start each line with a strong action verb, include a metric or scale if present or implied, no placeholders, no first person pronouns, keep each line under 220 characters.",
      "Return ONLY the rewritten bullet lines, one per line, no numbering, no extra commentary.",
    ].join("\n"),
    `Target role: ${role}\nRaw text:\n${body.text}`,
    fallback
  );

  const improved = aiResponse
    .split("\n")
    .map((line) => line.replace(/^[-*•\d.]\s*/, "").trim())
    .filter(Boolean)
    .join("\n");

  return NextResponse.json({ improved: improved || fallback });
}
