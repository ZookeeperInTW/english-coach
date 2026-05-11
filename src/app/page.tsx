import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import ArchiveButton from "@/components/ArchiveButton";

export default async function Home() {
  const supabase = await createClient();

  // 1. 取得當前使用者
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 2. 如果已登入，處理封存新聞
  let archivedNewsIds: string[] = [];
  if (user) {
    // 2a. 先清除超過 30 天的封存紀錄
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await supabase
      .from("user_archived_news")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", thirtyDaysAgo.toISOString());

    // 2b. 取得最新的封存新聞 ID 列表
    const { data: archived, error: archivedError } = await supabase
      .from("user_archived_news")
      .select("news_id")
      .eq("user_id", user.id);

    if (archivedError) {
      console.error("Error fetching archived news:", archivedError);
    }

    if (archived && archived.length > 0) {
      archivedNewsIds = archived.map((a) => a.news_id);
    }
  }

  // 3. 取得新聞
  const query = supabase
    .from("news")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50); // Fetch more so we have enough after filtering

  const { data: allNews } = await query;

  // 4. 在記憶體中過濾掉已封存的新聞，並取前 20 筆
  let news = allNews || [];
  if (archivedNewsIds.length > 0) {
    news = news.filter((item) => !archivedNewsIds.includes(item.id));
  }
  news = news.slice(0, 20);

  return (
    <div className="bg-bg-beige min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight sm:text-5xl">
            每日英語教練
          </h1>
          <p className="mt-4 text-xl text-text-main/70 max-w-2xl">
            透過最新的國際與財金新聞，同步提升您的英語閱讀與財經知識。
          </p>
        </header>

        {!news || news.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-accent-soft p-12 text-center">
            <h2 className="text-2xl font-semibold text-text-main">
              尚無新聞資料
            </h2>
            <p className="mt-4 text-text-main/60">
              新聞正在同步中，或您已讀完所有新聞，請稍後再試。
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-accent-soft overflow-hidden hover:shadow-md transition-shadow flex flex-col"
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
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        item.category === "finance"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {item.category === "finance" ? "財金新聞" : "國際新聞"}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-text-main mb-2 line-clamp-2">
                    {item.title_en}
                  </h3>
                  <p className="text-gray-500 line-clamp-3 mb-6">
                    {item.title_zh}
                  </p>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    href={`/news/${item.id}`}
                    className="text-primary font-semibold hover:opacity-80 transition-opacity"
                  >
                    閱讀全文 & 學習單字 &rarr;
                  </Link>
                  {user && <ArchiveButton newsId={item.id} variant="icon" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
