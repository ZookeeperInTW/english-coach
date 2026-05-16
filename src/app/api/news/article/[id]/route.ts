import { NextResponse } from "next/server";
import sql from "@/utils/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [data] = await sql`
    SELECT content_bilingual, title_zh FROM news WHERE id = ${id}
  `;
  return NextResponse.json(data ?? {});
}
