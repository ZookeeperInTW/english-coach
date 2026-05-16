import { NextResponse } from "next/server";
import sql from "@/utils/db";
import { translateText, translateToBilingual } from "@/services/aiService";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const [article] = await sql`SELECT * FROM news WHERE id = ${id}`;

  if (!article) {
    return NextResponse.json(
      { success: false, error: "Article not found" },
      { status: 404 }
    );
  }

  if (article.content_bilingual) {
    return NextResponse.json({
      success: true,
      translated: true,
      content_bilingual: article.content_bilingual,
      title_zh: article.title_zh,
    });
  }

  console.log(`[Translate API] Translating: ${article.title_en}`);
  console.log(
    `[Translate API] Content length: ${article.content_en?.length ?? 0}`
  );

  try {
    const [translatedTitle, bilingualContent] = await Promise.all([
      translateText(article.title_en),
      translateToBilingual(article.content_en),
    ]);

    console.log(
      `[Translate API] Bilingual result: ${JSON.stringify(bilingualContent)?.slice(0, 200)}`
    );

    try {
      await sql`
        UPDATE news
        SET
          title_zh          = ${translatedTitle},
          content_zh        = '已生成雙語對照',
          content_bilingual = ${sql.json(bilingualContent)}
        WHERE id = ${id}
      `;
    } catch (dbErr) {
      const dbError = dbErr instanceof Error ? dbErr.message : String(dbErr);
      console.error(`[Translate API] DB update failed:`, dbError);
      return NextResponse.json({
        success: true,
        translated: true,
        dbError,
        content_bilingual: bilingualContent,
        title_zh: translatedTitle,
      });
    }

    return NextResponse.json({
      success: true,
      translated: true,
      content_bilingual: bilingualContent,
      title_zh: translatedTitle,
    });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`[Translate API] AI failed:`, errorMessage);
    return NextResponse.json({
      success: false,
      translated: false,
      error: errorMessage,
    });
  }
}
