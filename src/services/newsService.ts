import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";

const parser = new Parser();

export async function fetchAndSyncNews() {
  const supabase = await createClient();

  const sources = [
    {
      url: "https://feeds.feedburner.com/rsscna/business",
      category: "finance",
    },
    {
      url: "https://www.taipeitimes.com/xml/index.rss",
      category: "international",
    },
  ];

  for (const source of sources) {
    try {
      const feed = await parser.parseURL(source.url);
      const top10 = feed.items.slice(0, 10);

      for (const item of top10) {
        // 檢查是否已存在
        const { data: existing } = await supabase
          .from("news")
          .select("id")
          .eq("source_url", item.link)
          .single();

        if (!existing) {
          // 這裡未來應整合 AI 翻譯 API
          // 目前先用 Mock 翻譯，或僅儲存英文
          const translatedTitle = `[翻譯] ${item.title}`;
          const translatedContent = `[翻譯] ${item.contentSnippet || item.content || ""}`;

          await supabase.from("news").insert({
            title_en: item.title,
            title_zh: translatedTitle,
            content_en: item.contentSnippet || item.content || "",
            content_zh: translatedContent,
            category: source.category,
            source_url: item.link,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch from ${source.url}:`, error);
    }
  }
}
