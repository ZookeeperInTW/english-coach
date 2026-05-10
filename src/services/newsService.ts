import Parser from "rss-parser";
import { createClient } from "@/utils/supabase/server";
import * as cheerio from "cheerio";
import { translateText, translateToBilingual } from "./aiService";

const parser = new Parser();

const newsSources = [
  {
    name: "Focus Taiwan (Society)",
    url: "https://feeds.feedburner.com/rsscna/engnews",
    category: "international",
  },
  {
    name: "Focus Taiwan (Business)",
    url: "https://feeds.feedburner.com/rsscna/engbusiness",
    category: "finance",
  },
];

/**
 * 爬取文章完整內文
 */
async function fetchFullContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    // Focus Taiwan 的正文在 .article .paragraph
    let content = $(".article .paragraph").text().trim();

    // 備援：嘗試 article p 標籤
    if (!content) {
      content = $("article p")
        .map((_, el) => $(el).text())
        .get()
        .join(" ")
        .trim();
    }

    return content;
  } catch (error) {
    console.error(`Failed to fetch content from ${url}:`, error);
    return "";
  }
}

/**
 * 使用者點進文章時才觸發 AI 翻譯（節省 API 流量）
 */
export async function ensureTranslation(articleId: string) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("id", articleId)
    .single();

  if (!article) return null;

  // 已有雙語對照，直接回傳
  if (article.content_bilingual) return article;

  console.log(`[On-demand] Translating: ${article.title_en}`);

  try {
    const [translatedTitle, bilingualContent] = await Promise.all([
      translateText(article.title_en),
      translateToBilingual(article.content_en),
    ]);

    const { data: updated } = await supabase
      .from("news")
      .update({
        title_zh: translatedTitle,
        content_zh: "已生成雙語對照",
        content_bilingual: bilingualContent,
      })
      .eq("id", articleId)
      .select()
      .single();

    return updated ?? article;
  } catch (error) {
    console.error("[On-demand] Translation failed:", error);
    return article;
  }
}

/**
 * 同步新聞（只抓英文，不觸發 AI）
 * forceClear=true 會先清空所有資料
 */
export async function fetchAndSyncNews(forceClear = false) {
  const supabase = await createClient();

  // 強制清空
  if (forceClear) {
    console.log("[Sync] Force clearing all news...");
    await supabase
      .from("news")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");
  }

  // 清理 30 天前的舊新聞
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  await supabase
    .from("news")
    .delete()
    .lt("created_at", thirtyDaysAgo.toISOString());

  // 逐一抓取各來源
  for (const source of newsSources) {
    try {
      console.log(`[Sync] Fetching from ${source.name}...`);
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const title = (item.title ?? "").trim();
        const link = (item.link ?? "").trim();

        if (!title || !link) continue;

        // 檢查是否已存在
        const { data: existing } = await supabase
          .from("news")
          .select("id")
          .eq("source_url", link)
          .maybeSingle();

        if (existing) continue;

        // 爬取完整內文
        const crawled = await fetchFullContent(link);
        const content = crawled || item.contentSnippet || item.content || "";

        if (content.trim().length < 30) {
          console.log(`[Sync] Skipping (too short): ${title}`);
          continue;
        }

        console.log(`[Sync] Saving (English only): ${title}`);

        const result = await supabase.from("news").insert({
          title_en: title,
          title_zh: "",
          content_en: content.trim(),
          content_zh: "",
          content_bilingual: null,
          category: source.category,
          source_url: link,
          image_url: item.enclosure?.url ?? null,
        });

        if (result.error) {
          console.error(`[Sync] Insert failed for: ${title}`, result.error);
        }
      }
    } catch (error) {
      console.error(`[Sync] Error fetching ${source.name}:`, error);
    }
  }

  console.log("[Sync] Done.");
}
