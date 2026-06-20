import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { ParsedResumeStructure } from "@/types/resume";

function buildParsePrompt(resumeText: string): string {
  return `Extract all information from the resume below and return ONLY valid JSON matching this exact schema. Use "" for missing text fields, [] for missing arrays, false for missing booleans. Dates should be in YYYY-MM format where possible:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "linkedin": "string (just the path, e.g. linkedin.com/in/username)",
  "targetRole": "string (most recent or current job title)",
  "summary": "string (professional summary if present, else empty)",
  "experience": [
    {
      "company": "string",
      "title": "string",
      "location": "string",
      "startDate": "string (YYYY-MM or YYYY)",
      "endDate": "string (YYYY-MM or YYYY, empty if current)",
      "current": false,
      "description": "string (all bullets joined with newlines, keep original wording)"
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "field": "string",
      "startYear": "string",
      "endYear": "string",
      "gpa": "string"
    }
  ],
  "skills": ["string"],
  "certifications": "string (all certifications/awards joined with newlines)"
}

RESUME:
${resumeText.slice(0, 3500)}`;
}

function heuristicParse(text: string): ParsedResumeStructure {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const emailMatch = text.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  const phoneMatch = text.match(/[\+]?[\d\s\-\(\)]{10,16}/);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);

  // Name heuristic: first non-email, non-phone line
  const nameCandidate = lines.find(
    (l) => !l.includes("@") && !l.match(/^\d/) && l.length < 60 && !l.match(/^(resume|cv|curriculum)/i)
  ) ?? "";

  // Skills section
  let skills: string[] = [];
  const skillIdx = lines.findIndex((l) => /^skills/i.test(l));
  if (skillIdx >= 0) {
    const skillBlock = lines.slice(skillIdx + 1, skillIdx + 5).join(" ");
    skills = skillBlock
      .split(/[,|•·\/]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 35)
      .slice(0, 20);
  }

  return {
    fullName: nameCandidate,
    email: emailMatch?.[0] ?? "",
    phone: phoneMatch?.[0]?.trim() ?? "",
    location: "",
    linkedin: linkedinMatch?.[0] ?? "",
    targetRole: "",
    summary: "",
    experience: [],
    education: [],
    skills,
    certifications: "",
  };
}

function sanitizeParsed(parsed: Partial<ParsedResumeStructure>): ParsedResumeStructure {
  return {
    fullName: String(parsed.fullName ?? ""),
    email: String(parsed.email ?? ""),
    phone: String(parsed.phone ?? ""),
    location: String(parsed.location ?? ""),
    linkedin: String(parsed.linkedin ?? ""),
    targetRole: String(parsed.targetRole ?? ""),
    summary: String(parsed.summary ?? ""),
    experience: Array.isArray(parsed.experience)
      ? parsed.experience.map((e) => ({
          company: String(e.company ?? ""),
          title: String(e.title ?? ""),
          location: String(e.location ?? ""),
          startDate: String(e.startDate ?? ""),
          endDate: String(e.endDate ?? ""),
          current: Boolean(e.current),
          description: String(e.description ?? ""),
        }))
      : [],
    education: Array.isArray(parsed.education)
      ? parsed.education.map((e) => ({
          institution: String(e.institution ?? ""),
          degree: String(e.degree ?? ""),
          field: String(e.field ?? ""),
          startYear: String(e.startYear ?? ""),
          endYear: String(e.endYear ?? ""),
          gpa: String(e.gpa ?? ""),
        }))
      : [],
    skills: Array.isArray(parsed.skills) ? parsed.skills.map(String).filter(Boolean) : [],
    certifications: String(parsed.certifications ?? ""),
  };
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { resumeText?: string };

  if (!body.resumeText?.trim()) {
    return NextResponse.json({ error: "resumeText is required" }, { status: 400 });
  }

  const aiRaw = await callOptionalAi(
    "You are an expert resume parser. Extract all information from resumes and return ONLY valid JSON with no additional text.",
    buildParsePrompt(body.resumeText),
    ""
  );

  if (aiRaw) {
    try {
      const jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as Partial<ParsedResumeStructure>;
        return NextResponse.json(sanitizeParsed(parsed));
      }
    } catch {
      // fall through to heuristic
    }
  }

  return NextResponse.json(heuristicParse(body.resumeText));
}
