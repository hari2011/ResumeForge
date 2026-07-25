import fs from "fs";
import path from "path";
import initSqlJs, { type Database as SqlJsDatabase } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import * as schema from "./schema";

/**
 * Local, zero-config SQLite database for the resume library — no Docker, no external
 * server, no accounts. Uses sql.js (SQLite compiled to WebAssembly) instead of a native
 * addon like better-sqlite3: native bindings can segfault when their prebuilt binary
 * doesn't exactly match the host's Node ABI/architecture, which WASM avoids entirely by
 * running the same bytecode everywhere. The trade-off is that sql.js is in-memory, so we
 * export and write the whole file to disk after every mutation via `persistDb()`.
 *
 * The .db file lives under `data/` at the project root and can be backed up or deleted
 * like any other local file. This is the "reliable, structured storage" adaptation of
 * Reactive Resume's Postgres+Drizzle stack, scaled down to fit this project's
 * local-first, no-login design.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "resumeforge.db");

declare global {
  // eslint-disable-next-line no-var
  var __resumeforgeSqlJsDb: SqlJsDatabase | undefined;
  // eslint-disable-next-line no-var
  var __resumeforgeSqlJsInit: Promise<SqlJsDatabase> | undefined;
}

async function initRawDb(): Promise<SqlJsDatabase> {
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file),
  });

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const existingBytes = fs.existsSync(DB_PATH) ? fs.readFileSync(DB_PATH) : undefined;
  const raw = existingBytes ? new SQL.Database(existingBytes) : new SQL.Database();

  raw.run(`
    CREATE TABLE IF NOT EXISTS resumes (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      template_id TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
  `);

  return raw;
}

async function getRawDb(): Promise<SqlJsDatabase> {
  if (globalThis.__resumeforgeSqlJsDb) return globalThis.__resumeforgeSqlJsDb;
  if (!globalThis.__resumeforgeSqlJsInit) globalThis.__resumeforgeSqlJsInit = initRawDb();
  const raw = await globalThis.__resumeforgeSqlJsInit;
  globalThis.__resumeforgeSqlJsDb = raw;
  return raw;
}

/** Write the current in-memory database back to disk. Call after any insert/update/delete. */
export async function persistDb(): Promise<void> {
  const raw = await getRawDb();
  fs.writeFileSync(DB_PATH, Buffer.from(raw.export()));
}

/** Get a Drizzle query-builder bound to the local SQLite (sql.js/WASM) database. */
export async function getDb() {
  const raw = await getRawDb();
  return drizzle(raw, { schema });
}
