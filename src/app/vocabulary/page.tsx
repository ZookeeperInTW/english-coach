import { createClient } from "@/utils/supabase/server";

export default async function VocabularyPage() {
  const supabase = await createClient();

  const { data: vocabList } = await supabase
    .from("vocabulary")
    .select("*, sentences(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            我的單字庫
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            收錄您在閱讀新聞時標記的單字，並由 AI 為您生成專屬例句。
          </p>
        </header>

        {!vocabList || vocabList.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <h2 className="text-2xl font-semibold text-gray-900">
              單字庫目前是空的
            </h2>
            <p className="mt-4 text-gray-500">
              去閱讀新聞並點擊不熟的單字來開始您的學習之旅吧！
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {vocabList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-3xl font-black text-blue-600 tracking-tight">
                    {item.word}
                  </h2>
                  <span className="text-gray-400 text-sm">
                    新增日期：
                    {new Date(item.created_at).toLocaleDateString("zh-TW")}
                  </span>
                </div>

                <div className="space-y-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                    AI 建議例句
                  </h3>
                  {item.sentences && item.sentences.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {item.sentences.map(
                        (s: {
                          id: string;
                          sentence_en: string;
                          sentence_zh: string;
                        }) => (
                          <div
                            key={s.id}
                            className="bg-blue-50 rounded-xl p-6 border border-blue-100"
                          >
                            <p className="text-lg font-medium text-gray-800 mb-2 leading-relaxed">
                              {s.sentence_en}
                            </p>
                            <p className="text-gray-600">{s.sentence_zh}</p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">正在生成例句...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
