import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import { translateText } from "./aiService";

const parser = new Parser();

export async function fetchAndSyncNews() {
  console.log("Starting news sync service...");
  const supabase = await createClient();

  const sources = [
    {
      url: "https://feeds.feedburner.com/rsscna/engnews/",
      category: "international",
    },
    {
      url: "https://www.taipeitimes.com/xml/index.rss",
      category: "international",
    },
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

          // 1. 同時檢查連結與標題是否重複
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
            let translatedContent = "翻譯處理中...";

            try {
              // 嘗試 AI 翻譯
              translatedTitle = await translateText(title);
              await new Promise((resolve) => setTimeout(resolve, 1000));
              translatedContent = await translateText(content);
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch (aiError) {
              console.warn(
                `AI Translation failed for "${title}", saving anyway.`,
                aiError
              );
              // 如果翻譯失敗，標題暫時用英文代替，內容標註待翻譯
              translatedTitle = `(英) ${title}`;
            }

            const { error: insertError } = await supabase.from("news").insert({
              title_en: title,
              title_zh: translatedTitle,
              content_en: content,
              content_zh: translatedContent,
              category: source.category,
              source_url: link,
              image_url: item.enclosure?.url || null, // 嘗試從 enclosure 抓取圖片
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
