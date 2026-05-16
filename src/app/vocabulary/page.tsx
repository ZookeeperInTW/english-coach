import sql from "@/utils/db";

export default async function VocabularyPage() {
  const vocabList = await sql`
    SELECT
      v.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', s.id,
            'sentence_en', s.sentence_en,
            'sentence_zh', s.sentence_zh
          )
        ) FILTER (WHERE s.id IS NOT NULL),
        '[]'
      ) AS sentences
    FROM vocabulary v
    LEFT JOIN sentences s ON s.vocabulary_id = v.id
    GROUP BY v.id
    ORDER BY v.created_at DESC
  `;

  return (
    <div className="bg-bg-beige min-h-screen py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-text-main tracking-tight">
            我的單字庫
          </h1>
          <p className="mt-2 text-lg text-text-main/60">
            收錄您在閱讀新聞時標記的單字，並由 AI 為您生成專屬例句。
          </p>
        </header>

        {vocabList.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-accent-soft p-12 text-center">
            <h2 className="text-2xl font-semibold text-text-main">
              單字庫目前是空的
            </h2>
            <p className="mt-4 text-text-main/60">
              去閱讀新聞並點擊不熟的單字來開始您的學習之旅吧！
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {vocabList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-accent-soft p-8 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-baseline justify-between mb-2">
                  <div className="flex items-baseline gap-4">
                    <h2 className="text-3xl font-black text-primary tracking-tight">
                      {item.word}
                    </h2>
                    {item.phonetic && (
                      <span className="text-lg text-secondary font-medium font-serif">
                        {item.phonetic}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(item.created_at).toLocaleDateString("zh-TW")}
                  </span>
                </div>

                {item.definition_zh && (
                  <p className="text-xl text-text-main/80 mb-8 font-medium">
                    {item.definition_zh}
                  </p>
                )}

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
                            className="bg-primary/5 rounded-xl p-6 border border-primary/10"
                          >
                            <p className="text-lg font-medium text-text-main mb-2 leading-relaxed">
                              {s.sentence_en}
                            </p>
                            <p className="text-text-main/70">{s.sentence_zh}</p>
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
