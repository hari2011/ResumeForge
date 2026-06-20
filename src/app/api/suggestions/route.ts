import { NextRequest, NextResponse } from "next/server";
import { callOptionalAi } from "@/lib/ai";
import { bulletSuggestions, generateBulletSuggestions } from "@/data/bullet-suggestions";

interface BulletRequest {
  role: string;
  industry?: string;
  limit?: number;
}

// O*NET Web Services (US Dept of Labor) - free public API, no ToS issues
// Configure via ONET_API_USER env var (free at https://services.onetcenter.org/developer/)
async function fetchOnetContext(role: string): Promise<string> {
  const onetUser = process.env.ONET_API_USER;
  if (!onetUser) return "";
  try {
    const searchUrl = `https://services.onetcenter.org/ws/online/search?keyword=${encodeURIComponent(role)}&end=1`;
    const res = await fetch(searchUrl, {
      headers: { Authorization: `Basic ${Buffer.from(`${onetUser}:${onetUser}`).toString("base64")}`, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { occupation?: { code: string; title: string }[] };
    const code = data.occupation?.[0]?.code;
    if (!code) return "";
    const taskRes = await fetch(`https://services.onetcenter.org/ws/online/occupations/${code}/summary/tasks`, {
      headers: { Authorization: `Basic ${Buffer.from(`${onetUser}:${onetUser}`).toString("base64")}`, Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!taskRes.ok) return "";
    const taskData = (await taskRes.json()) as { task?: { description: string }[] };
    return (taskData.task ?? []).slice(0, 6).map((t) => t.description).join("; ");
  } catch {
    return "";
  }
}

function buildAiPrompt(role: string, onetContext: string): string {
  const base = `Generate exactly 8 strong resume bullet points for a ${role}.
Rules:
- Start each bullet with a past-tense action verb (Led, Built, Grew, Reduced, Delivered, Improved, Launched, Designed, etc.)
- Include a metric placeholder in [brackets] — e.g. [X]%, $[X]M, [X] users
- Format: action + what + measurable result. Max 120 characters each.
- Cover: technical delivery, team leadership, business impact, process improvement
- Output ONLY the 8 bullets, one per line, no numbering, no preamble`;
  return onetContext ? `${base}\nRole context from O*NET: ${onetContext}` : base;
}

function parseAiBullets(raw: string): string[] {
  return raw
    .split("\n")
    .map((l) => l.replace(/^[-•*\d.]+\s*/, "").trim())
    .filter((l) => l.length > 20 && l.length < 160)
    .slice(0, 8);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as BulletRequest;
  if (!body.role) {
    return NextResponse.json({ error: "role is required" }, { status: 400 });
  }

  const limit = body.limit ?? 8;
  const roleKey = body.role.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const hasStaticData = Boolean(bulletSuggestions[roleKey]);

  // Fetch O*NET context in parallel with static data lookup (non-blocking)
  const onetContext = await fetchOnetContext(body.role);

  // Try AI generation if: no static data for this exact role, OR O*NET context available
  let aiBullets: string[] = [];
  if (!hasStaticData || onetContext) {
    const aiRaw = await callOptionalAi(
      "You are an expert resume writer with deep knowledge of global job market trends and ATS optimisation.",
      buildAiPrompt(body.role, onetContext),
      "" // empty fallback — we'll use static data below
    );
    if (aiRaw) {
      aiBullets = parseAiBullets(aiRaw);
    }
  }

  // Merge: AI bullets first (most relevant), then static data to pad to `limit`
  const staticBullets = generateBulletSuggestions(body.role);
  const merged = aiBullets.length >= 4
    ? [...aiBullets, ...staticBullets.filter((b) => !aiBullets.includes(b))].slice(0, limit)
    : [...staticBullets, ...aiBullets.filter((b) => !staticBullets.includes(b))].slice(0, limit);

  return NextResponse.json({
    suggestions: merged,
    role: body.role,
    source: aiBullets.length > 0 ? (onetContext ? "ai+onet" : "ai+static") : "static",
  });
}
