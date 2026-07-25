import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { getDb, persistDb } from "@/lib/db/client";
import { resumes } from "@/lib/db/schema";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/resumes/[id] — full resume record, including the parsed data snapshot. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const db = await getDb();
  const row = db.select().from(resumes).where(eq(resumes.id, id)).get();

  if (!row) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  let data: unknown = {};
  try {
    data = JSON.parse(row.data);
  } catch {
    return NextResponse.json({ error: "Saved resume data is corrupted" }, { status: 500 });
  }

  return NextResponse.json({
    id: row.id,
    name: row.name,
    templateId: row.templateId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    data,
  });
}

/** DELETE /api/resumes/[id] — permanently remove a saved resume. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const db = await getDb();
  const existing = db.select().from(resumes).where(eq(resumes.id, id)).get();

  if (!existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  db.delete(resumes).where(eq(resumes.id, id)).run();
  await persistDb();
  return NextResponse.json({ ok: true });
}

/** POST /api/resumes/[id] — duplicate this resume into a new record (used by the dashboard's "Duplicate" action). */
export async function POST(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const db = await getDb();
  const existing = db.select().from(resumes).where(eq(resumes.id, id)).get();

  if (!existing) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }

  const now = Math.floor(Date.now() / 1000);
  const newId = randomUUID();
  db.insert(resumes).values({
    id: newId,
    name: `${existing.name} (Copy)`,
    templateId: existing.templateId,
    data: existing.data,
    createdAt: now,
    updatedAt: now,
  }).run();
  await persistDb();

  return NextResponse.json({ id: newId, createdAt: now, updatedAt: now }, { status: 201 });
}
