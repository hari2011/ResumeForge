import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/data/cover-letters";

interface CoverLetterRequest {
  candidateName: string;
  targetRole: string;
  targetCompany: string;
  yearsOfExperience: number;
  keyAchievements: string;
  tone?: "professional" | "friendly" | "executive";
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as CoverLetterRequest;

  const required = [
    "candidateName",
    "targetRole",
    "targetCompany",
    "yearsOfExperience",
    "keyAchievements",
  ];
  for (const field of required) {
    if (!body[field as keyof CoverLetterRequest]) {
      return NextResponse.json(
        { error: `${field} is required` },
        { status: 400 }
      );
    }
  }

  const letter = generateCoverLetter(
    body.candidateName,
    body.targetRole,
    body.targetCompany,
    body.yearsOfExperience,
    body.keyAchievements,
    body.tone || "professional"
  );

  return NextResponse.json({ coverLetter: letter });
}
