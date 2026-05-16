import { NextResponse } from "next/server";
import sql from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    hasDbUrl: !!process.env.DATABASE_URL,
    dbUrlPrefix: process.env.DATABASE_URL
      ? process.env.DATABASE_URL.slice(0, 30) + "..."
      : null,
    sqlIsNull: sql === null,
    nodeEnv: process.env.NODE_ENV,
  };

  if (sql) {
    try {
      const [row] = await sql`SELECT NOW() as time, current_database() as db`;
      info.dbConnected = true;
      info.dbTime = row.time;
      info.dbName = row.db;

      const tables = await sql`
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      info.tables = tables.map((t) => t.table_name);
    } catch (err) {
      info.dbConnected = false;
      info.dbError =
        err instanceof Error
          ? err.message
          : JSON.stringify(err, Object.getOwnPropertyNames(err));
    }
  }

  return NextResponse.json(info);
}
