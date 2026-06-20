import { NextRequest, NextResponse } from "next/server";
import { parseResumeFile } from "@/lib/file-parsers";
import { parseResumeIntoSections } from "@/lib/resume-utils";

export const runtime = "nodejs";

function buildParsedResponse(resumeText: string) {
  const sections = parseResumeIntoSections(resumeText);
  return { resumeText, sections, detectedLength: resumeText.length };
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    try {
      const resumeText = await parseResumeFile(file);

      if (!resumeText.trim()) {
        return NextResponse.json(
          { error: "No text could be extracted from this file." },
          { status: 400 }
        );
      }

      return NextResponse.json(buildParsedResponse(resumeText));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Could not parse uploaded file. Please try a different file.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const body = (await request.json()) as { resumeText?: string };
  const resumeText = body.resumeText ?? "";

  if (!resumeText.trim()) {
    return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
  }

  return NextResponse.json(buildParsedResponse(resumeText));
}
