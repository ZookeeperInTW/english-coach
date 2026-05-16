import Parser from "rss-parser";
import sql from "@/utils/db";
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

    let content = $(".article .paragraph").text().trim();

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

export async function ensureTranslation(articleId: string) {
  const [article] = await sql`
    SELECT * FROM news WHERE id = ${articleId}
  `;

  if (!article) return null;

  if (article.content_bilingual) return article;

  console.log(`[On-demand] Translating: ${article.title_en}`);

  try {
    const [translatedTitle, bilingualContent] = await Promise.all([
      translateText(article.title_en),
      translateToBilingual(article.content_en),
    ]);

    console.log(
      `[On-demand] Got bilingual: ${JSON.stringify(bilingualContent)?.slice(0, 100)}`
    );

    const [updated] = await sql`
      UPDATE news
      SET
        title_zh          = ${translatedTitle},
        content_zh        = '已生成雙語對照',
        content_bilingual = ${sql.json(bilingualContent)}
      WHERE id = ${articleId}
      RETURNING *
    `;

    return (
      updated ?? {
        ...article,
        title_zh: translatedTitle,
        content_bilingual: bilingualContent,
      }
    );
  } catch (error) {
    console.error("[On-demand] Translation failed:", error);
    return article;
  }
}

export async function fetchAndSyncNews(forceClear = false) {
  if (forceClear) {
    console.log("[Sync] Force clearing all news...");
    await sql`DELETE FROM news`;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  await sql`DELETE FROM news WHERE created_at < ${thirtyDaysAgo.toISOString()}`;

  for (const source of newsSources) {
    try {
      console.log(`[Sync] Fetching from ${source.name}...`);
      const feed = await parser.parseURL(source.url);

      for (const item of feed.items) {
        const title = (item.title ?? "").trim();
        const link = (item.link ?? "").trim();

        if (!title || !link) continue;

        const [existing] = await sql`
          SELECT id FROM news WHERE source_url = ${link}
        `;

        if (existing) continue;

        const crawled = await fetchFullContent(link);
        const content = crawled || item.contentSnippet || item.content || "";

        if (content.trim().length < 30) {
          console.log(`[Sync] Skipping (too short): ${title}`);
          continue;
        }

        console.log(`[Sync] Saving (English only): ${title}`);

        try {
          await sql`
            INSERT INTO news
              (title_en, title_zh, content_en, content_zh, content_bilingual,
               category, source_url, image_url)
            VALUES
              (${title}, '', ${content.trim()}, '', ${null},
               ${source.category}, ${link}, ${item.enclosure?.url ?? null})
          `;
        } catch (err) {
          console.error(`[Sync] Insert failed for: ${title}`, err);
        }
      }
    } catch (error) {
      console.error(`[Sync] Error fetching ${source.name}:`, error);
    }
  }

  console.log("[Sync] Done.");
}
