import { notFound } from "next/navigation";
import NewsContent from "@/components/NewsContent";
import { ensureTranslation } from "@/services/newsService";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 觸發即時翻譯（如果已有翻譯會秒回，沒有則會等待 AI 產出）
  const article = await ensureTranslation(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-bg-beige min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                article.category === "finance"
                  ? "bg-primary/10 text-primary"
                  : "bg-secondary/10 text-secondary"
              }`}
            >
              {article.category === "finance" ? "財金新聞" : "國際新聞"}
            </span>
            <span className="text-gray-400 text-sm">
              {new Date(article.created_at).toLocaleDateString("zh-TW")}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight sm:text-5xl mb-4">
            {article.title_en}
          </h1>
          <p className="text-2xl text-primary font-medium italic">
            {article.title_zh}
          </p>
        </div>

        <NewsContent
          contentEn={article.content_en}
          contentZh={article.content_zh}
          contentBilingual={article.content_bilingual}
        />
      </div>
    </div>
  );
}
