import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateSentences, getWordDetails } from "@/services/aiService";

export async function POST(request: Request) {
  const { word } = await request.json();
  const supabase = await createClient();

  // 1. 取得目前用戶 (假設已登入)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. 取得單字詳細資訊 (定義、音標)
  const details = await getWordDetails(word);

  // 3. 加入單字庫
  const { data: vocab, error: vocabError } = await supabase
    .from("vocabulary")
    .insert({
      word,
      user_id: user?.id,
      definition_zh: details.definition_zh,
      phonetic: details.phonetic,
    })
    .select()
    .single();

  if (vocabError) {
    return NextResponse.json({ error: vocabError.message }, { status: 500 });
  }

  // 4. 觸發 AI 生成例句
  const sentences = await generateSentences(word);

  if (sentences && sentences.length > 0) {
    await supabase.from("sentences").insert(
      sentences.map((s: { en: string; zh: string }) => ({
        vocabulary_id: vocab.id,
        sentence_en: s.en,
        sentence_zh: s.zh,
      }))
    );
  }

  return NextResponse.json({
    message: "Word added with details and sentences generated",
  });
}
