import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import NewsContent from "@/components/NewsContent";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("news")
    .select("*")
    .eq("id", id)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <div className="bg-white min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center space-x-4 mb-6">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                article.category === "finance"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {article.category === "finance" ? "財金新聞" : "國際新聞"}
            </span>
            <span className="text-gray-400 text-sm">
              {new Date(article.created_at).toLocaleDateString("zh-TW")}
            </span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            {article.title_en}
          </h1>
          <p className="text-2xl text-blue-600 font-medium italic">
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
