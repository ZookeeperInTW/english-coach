import { NextResponse } from "next/server";
import sql from "@/utils/db";
import { generateSentences, getWordDetails } from "@/services/aiService";

export async function POST(request: Request) {
  const { word } = await request.json();

  const details = await getWordDetails(word);

  const [vocab] = await sql`
    INSERT INTO vocabulary (word, definition_zh, phonetic)
    VALUES (${word}, ${details.definition_zh}, ${details.phonetic})
    RETURNING *
  `;

  if (!vocab) {
    return NextResponse.json(
      { error: "Failed to insert word" },
      { status: 500 }
    );
  }

  const sentences = await generateSentences(word);

  if (sentences && sentences.length > 0) {
    await sql`
      INSERT INTO sentences ${sql(
        sentences.map((s: { en: string; zh: string }) => ({
          vocabulary_id: vocab.id,
          sentence_en: s.en,
          sentence_zh: s.zh,
        }))
      )}
    `;
  }

  return NextResponse.json({
    message: "Word added with details and sentences generated",
  });
}
