import { NextResponse } from "next/server";
import { ensureTranslation } from "@/services/newsService";
export const dynamic = "force-dynamic";
export const maxDuration = 60; // 告訴 Vercel 最多等 60 秒

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const article = await ensureTranslation(id);
  // 直接回傳翻譯結果，不需要 Client 再發一次請求
  return NextResponse.json({
    success: true,
    translated: !!article?.content_bilingual,
    content_bilingual: article?.content_bilingual ?? null,
    title_zh: article?.title_zh ?? "",
  });
}
