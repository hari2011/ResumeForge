import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { desc, eq } from "drizzle-orm";
import { getDb, persistDb } from "@/lib/db/client";
import { resumes } from "@/lib/db/schema";

/** Shape saved into the `data` column — the same JSON snapshot produced by exportResumeData(). */
interface ResumeSnapshot {
  [key: string]: unknown;
}

interface SaveResumePayload {
  id?: string;
  name: string;
  templateId: string;
  data: ResumeSnapshot;
}

function toSummary(row: typeof resumes.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    templateId: row.templateId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** GET /api/resumes — list all saved resumes (most recently updated first), summary only (no data blob). */
export async function GET() {
  const db = await getDb();
  const rows = db.select().from(resumes).orderBy(desc(resumes.updatedAt)).all();
  return NextResponse.json({ resumes: rows.map(toSummary) });
}

/** POST /api/resumes — create a new saved resume, or update an existing one if `id` is provided. */
export async function POST(request: NextRequest) {
  const body = (await request.json()) as SaveResumePayload;

  if (!body?.name?.trim() || !body?.templateId || !body?.data) {
    return NextResponse.json({ error: "name, templateId, and data are required" }, { status: 400 });
  }

  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  const serializedData = JSON.stringify(body.data);

  if (body.id) {
    const existing = db.select().from(resumes).where(eq(resumes.id, body.id)).get();
    if (!existing) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }
    db
      .update(resumes)
      .set({ name: body.name.trim(), templateId: body.templateId, data: serializedData, updatedAt: now })
      .where(eq(resumes.id, body.id))
      .run();
    await persistDb();
    return NextResponse.json({ id: body.id, updatedAt: now });
  }

  const id = randomUUID();
  db.insert(resumes).values({
    id,
    name: body.name.trim(),
    templateId: body.templateId,
    data: serializedData,
    createdAt: now,
    updatedAt: now,
  }).run();
  await persistDb();

  return NextResponse.json({ id, createdAt: now, updatedAt: now }, { status: 201 });
}
