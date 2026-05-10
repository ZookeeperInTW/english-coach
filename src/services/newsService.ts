import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import * as cheerio from "cheerio";
import { translateText, translateToBilingual } from "./aiService";

const parser = new Parser();

/**
 * 抓取網頁完整內容
 */
async function fetchFullContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Focus Taiwan 的正文通常在 .article .paragraph 內
    let content = $(".article .paragraph").text().trim();

    // 如果找不到，試試通用的 p 標籤組合
    if (!content) {
      content = $("article p")
        .map((_, el) => $(el).text())
        .get()
        .join("\n");
    }

    return content;
  } catch (error) {
    console.error(`Failed to fetch full content from ${url}:`, error);
    return "";
  }
}

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
            // 先嘗試爬取網頁完整內文
            let content = await fetchFullContent(link);

            // 如果爬不到完整內文，再用 RSS 的摘要作為備援
            if (!content || content.length < 50) {
              content =
                (
                  item.contentSnippet ||
                  item.content ||
                  item.description ||
                  ""
                ).trim() || title;
            }

            // 如果內容依然過短，則判定為無效新聞
            if (content.length < 10) {
              console.log(`Skipping invalid news: ${title}`);
              continue;
            }

            console.log(
              `Syncing full content for: ${title} (${content.length} chars)`
            );

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
