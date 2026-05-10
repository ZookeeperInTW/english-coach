import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();

  const { data: news } = await supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            每日英語教練
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl">
            透過最新的國際與財金新聞，同步提升您的英語閱讀與財經知識。
          </p>
        </header>

        {!news || news.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              尚無新聞資料
            </h2>
            <p className="mt-4 text-gray-500">
              請先確認您已設定好 Supabase 並執行了新聞同步。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {item.image_url && (
                  <div className="relative h-48 w-full">
                    <img
                      src={item.image_url}
                      alt={item.title_en}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-8 flex-grow">
                  <div className="flex items-center space-x-2 mb-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.category === "finance"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {item.category === "finance" ? "財金新聞" : "國際新聞"}
                    </span>
                    <span className="text-gray-400 text-xs">
                      {new Date(item.created_at).toLocaleDateString("zh-TW")}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {item.title_en}
                  </h2>
                  <p className="text-lg text-blue-600 font-medium mb-6">
                    {item.title_zh}
                  </p>
                  <div className="space-y-4">
                    <p className="text-gray-600 line-clamp-3 italic">
                      {item.content_en}
                    </p>
                    <p className="text-gray-500 line-clamp-3">
                      {item.content_zh}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    href={`/news/${item.id}`}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    閱讀全文 & 學習單字 &rarr;
                  </Link>
                  <button className="text-gray-400 hover:text-blue-600 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
