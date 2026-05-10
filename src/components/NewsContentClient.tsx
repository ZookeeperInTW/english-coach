"use client";

import { useEffect, useState } from "react";

interface BilingualSentence {
  en: string;
  zh: string;
}

interface Props {
  articleId: string;
  contentEn: string;
  contentBilingual?: BilingualSentence[] | null;
}

export default function NewsContentClient({
  articleId,
  contentEn,
  contentBilingual: initialBilingual,
}: Props) {
  const [bilingual, setBilingual] = useState<BilingualSentence[] | null>(
    initialBilingual ?? null
  );
  const [translating, setTranslating] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  // 若尚無翻譯，在背景靜默觸發
  useEffect(() => {
    if (bilingual && bilingual.length > 0) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setTranslating(true);
      fetch(`/api/news/translate/${articleId}`, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          if (data.translated) {
            return fetch(`/api/news/article/${articleId}`, {
              signal: controller.signal,
            })
              .then((r) => r.json())
              .then((article) => {
                if (article?.content_bilingual) {
                  setBilingual(article.content_bilingual);
                }
              });
          }
        })
        .catch(() => {})
        .finally(() => setTranslating(false));
    }, 0);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [articleId, bilingual]);

  const handleWordClick = (word: string) => {
    const clean = word.replace(/[.,/#!$%^&*;:{}=\-_`~()"""'']/g, "");
    if (clean.length > 1) setSelectedWord(clean);
  };

  const addToVocab = async (word: string) => {
    try {
      const res = await fetch("/api/vocabulary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      if (res.ok) {
        alert(`已將 "${word}" 加入單字庫！`);
        setSelectedWord(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderWords = (text: string) =>
    text.split(" ").map((word, i) => (
      <span
        key={i}
        onClick={() => handleWordClick(word)}
        className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-0.5 transition-colors"
      >
        {word}{" "}
      </span>
    ));

  const sentences = (contentEn || "")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 10);

  const hasBilingual = bilingual && bilingual.length > 0;

  return (
    <div className="max-w-3xl mx-auto pb-32">
      {/* 翻譯中橫幅 */}
      {translating && (
        <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 text-sm text-primary mb-8">
          <span className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>AI 正在生成雙語翻譯，完成後會自動更新...</span>
        </div>
      )}

      {hasBilingual ? (
        /* ── 雙語對照模式 ── */
        <div className="space-y-8">
          {bilingual.map((pair, i) => (
            <div
              key={i}
              className="border-b border-accent-soft pb-8 last:border-0"
            >
              <p className="text-xl text-text-main leading-relaxed font-serif mb-2">
                {renderWords(pair.en)}
              </p>
              <p className="text-base text-primary/90 leading-relaxed">
                {pair.zh}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* ── 純英文逐句（翻譯前）── */
        <div className="space-y-6">
          {sentences.length > 0 ? (
            sentences.map((sentence, i) => (
              <div
                key={i}
                className="border-b border-accent-soft pb-6 last:border-0"
              >
                <p className="text-xl text-text-main leading-relaxed font-serif">
                  {renderWords(sentence)}
                </p>
                <p className="mt-1 text-sm text-text-main/30 italic">
                  — 翻譯生成中...
                </p>
              </div>
            ))
          ) : (
            <p className="text-text-main/40 italic">載入中...</p>
          )}
        </div>
      )}

      {/* 點擊單字浮動工具列 */}
      {selectedWord && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-accent-soft rounded-full px-8 py-4 flex items-center gap-5 z-50">
          <span className="text-lg font-bold text-text-main">
            {selectedWord}
          </span>
          <button
            onClick={() => addToVocab(selectedWord)}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            加入單字庫
          </button>
          <button
            onClick={() => setSelectedWord(null)}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
