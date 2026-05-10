import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import { translateText } from "./aiService";

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
          const content = item.contentSnippet || item.content || "";

          // 使用 AI 翻譯
          const [translatedTitle, translatedContent] = await Promise.all([
            translateText(item.title || ""),
            translateText(content),
          ]);

          await supabase.from("news").insert({
            title_en: item.title,
            title_zh: translatedTitle,
            content_en: content,
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
