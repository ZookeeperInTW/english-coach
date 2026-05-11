import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import NewsContentClient from "@/components/NewsContentClient";
import ArchiveButton from "@/components/ArchiveButton";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // 取得當前登入使用者
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 直接抓取文章——不等 AI，秒開
  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) notFound();

  return (
    <div className="bg-bg-beige min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
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
            <div>
              <ArchiveButton newsId={id} variant="button" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight sm:text-5xl mb-4">
            {article.title_en}
          </h1>
          {article.title_zh && (
            <p className="text-2xl text-primary font-medium italic">
              {article.title_zh}
            </p>
          )}
        </div>

        {/* Client component 負責顯示內容並在背景觸發翻譯 */}
        <NewsContentClient
          articleId={id}
          contentEn={article.content_en}
          contentBilingual={article.content_bilingual}
        />
      </div>
    </div>
  );
}
