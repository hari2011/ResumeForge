import { NextResponse } from "next/server";
import { interviewQuestions } from "@/data/interview-questions";
import { resumeTemplates } from "@/data/templates";
import { coverLetterTemplates } from "@/data/cover-letters";

export async function GET() {
  return NextResponse.json({
    interviewQuestions,
    templates: resumeTemplates,
    coverLetterTemplates,
  });
}
