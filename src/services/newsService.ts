import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import { translateText, translateToBilingual } from "./aiService";

const parser = new Parser();

export async function fetchAndSyncNews() {
  console.log("Starting news sync service...");
  const supabase = await createClient();

  // 1. 自動清理 30 天前的舊新聞
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { error: deleteError } = await supabase
    .from("news")
    .delete()
    .lt("created_at", thirtyDaysAgo.toISOString());

  if (deleteError) {
    console.error("Failed to cleanup old news:", deleteError);
  } else {
    console.log("Cleanup completed: old news removed.");
  }

  // 移除暫時性的強制刪除邏輯

  const sources = [
    {
      url: "https://feeds.feedburner.com/rsscna/engnews/",
      category: "International",
    },
    { url: "https://www.taipeitimes.com/xml/index.rss", category: "Business" },
  ];

  for (const source of sources) {
    try {
      console.log(`Fetching from ${source.url}...`);
      const feed = await parser.parseURL(source.url);
      const itemsToProcess = feed.items.slice(0, 5); // 每次抓取前 5 則

      for (const item of itemsToProcess) {
        try {
          const title = item.title || "";
          const link = item.link || "";

          // 2. 同時檢查連結與標題是否重複
          const { data: existingUrl } = await supabase
            .from("news")
            .select("id")
            .eq("source_url", link)
            .maybeSingle();

          const { data: existingTitle } = await supabase
            .from("news")
            .select("id")
            .eq("title_en", title)
            .maybeSingle();

          if (!existingUrl && !existingTitle) {
            const content = item.contentSnippet || item.content || "";
            console.log(`Syncing: ${title}`);

            let translatedTitle = "翻譯處理中...";
            let bilingualContent = null;

            try {
              // 嘗試 AI 雙語翻譯
              translatedTitle = await translateText(title);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              bilingualContent = await translateToBilingual(content);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (aiError) {
              console.warn(
                `AI Translation failed for "${title}", saving anyway.`,
                aiError
              );
              translatedTitle = `(英) ${title}`;
            }

            const { error: insertError } = await supabase.from("news").insert({
              title_en: title,
              title_zh: translatedTitle,
              content_en: content,
              content_zh: "已轉換為雙語對照",
              content_bilingual: bilingualContent,
              category: source.category,
              source_url: link,
              image_url: item.enclosure?.url || null,
            });

            if (insertError) {
              console.error(`Failed to insert news: ${title}`, insertError);
            } else {
              console.log(`Successfully synced: ${title}`);
            }
          } else {
            console.log(`Skipping existing news: ${title}`);
          }
        } catch (itemError) {
          console.error(`Error processing item ${item.title}:`, itemError);
        }
      }
    } catch (error) {
      console.error(`Failed to fetch from ${source.url}:`, error);
    }
  }
}
