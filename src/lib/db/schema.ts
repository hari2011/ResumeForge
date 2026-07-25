import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

/**
 * A single saved resume in the local library. `data` stores the full JSON snapshot
 * of the builder's form state (same shape as `exportResumeData()` in new-resume/page.tsx)
 * so a resume can be reopened and edited exactly as it was left.
 *
 * This mirrors Reactive Resume's "Resume" table/dashboard concept, but backed by a
 * zero-config local SQLite (WASM, via sql.js) file instead of a hosted Postgres instance —
 * no accounts, no server to run, no network required. The whole point is portability: the
 * .db file can be copied, backed up, or deleted like any other local file.
 */
export const resumes = sqliteTable("resumes", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  templateId: text("template_id").notNull(),
  data: text("data").notNull(), // JSON-stringified builder snapshot
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type ResumeRow = typeof resumes.$inferSelect;
export type NewResumeRow = typeof resumes.$inferInsert;
