import { NextResponse } from "next/server";
import { ensureTranslation } from "@/services/newsService";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await ensureTranslation(id);
  return NextResponse.json({
    success: true,
    translated: !!article?.content_bilingual,
  });
}
