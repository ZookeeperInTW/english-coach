"use client";

import { useState } from "react";

interface BilingualSentence {
  en: string;
  zh: string;
}

interface NewsContentProps {
  contentEn: string;
  contentBilingual?: BilingualSentence[] | null;
}

export default function NewsContent({
  contentEn,
  contentBilingual,
}: NewsContentProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    const cleanWord = word.replace(/[.,/#!$%^&*;:{}=\-_`~()"""'']/g, "");
    if (cleanWord.length > 1) {
      setSelectedWord(cleanWord);
    }
  };

  const addToVocab = async (word: string) => {
    try {
      const response = await fetch("/api/vocabulary/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ word }),
      });
      if (response.ok) {
        alert(`已將 "${word}" 加入單字庫！`);
        setSelectedWord(null);
      }
    } catch (error) {
      console.error("Failed to add word:", error);
    }
  };

  // 渲染一段英文（每個字可點擊）
  const renderEnWords = (text: string) =>
    text.split(" ").map((word, i) => (
      <span
        key={i}
        onClick={() => handleWordClick(word)}
        className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-0.5 transition-colors"
      >
        {word}{" "}
      </span>
    ));

  // 將純英文內容依句點拆成句子陣列
  const splitIntoSentences = (text: string): string[] =>
    text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

  const hasBilingual = contentBilingual && contentBilingual.length > 0;

  // 尚無翻譯：顯示英文逐句（之後翻譯填入每句下面）
  const englishSentences = !hasBilingual
    ? splitIntoSentences(contentEn || "")
    : [];

  return (
    <div className="max-w-3xl mx-auto relative pb-32">
      {hasBilingual ? (
        /* ── 雙語對照模式 ─────────────────────── */
        <div className="space-y-8">
          {contentBilingual.map((pair, i) => (
            <div
              key={i}
              className="border-b border-accent-soft pb-8 last:border-0"
            >
              {/* 英文 */}
              <p className="text-xl text-text-main leading-relaxed font-serif mb-2">
                {renderEnWords(pair.en)}
              </p>
              {/* 中文翻譯，緊接在英文下 */}
              <p className="text-base text-primary/90 leading-relaxed">
                {pair.zh}
              </p>
            </div>
          ))}
        </div>
      ) : (
        /* ── 純英文模式（翻譯前）───────────────── */
        <div className="space-y-6">
          {/* 翻譯中提示橫幅 */}
          <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-3 text-sm text-primary">
            <span className="animate-spin text-lg">⏳</span>
            <span>AI 正在生成雙語翻譯，重新整理頁面即可查看翻譯結果</span>
          </div>

          {englishSentences.length > 0 ? (
            englishSentences.map((sentence, i) => (
              <div
                key={i}
                className="border-b border-accent-soft pb-6 last:border-0"
              >
                <p className="text-xl text-text-main leading-relaxed font-serif">
                  {renderEnWords(sentence)}
                </p>
                {/* 中文佔位 */}
                <p className="mt-1 text-sm text-text-main/30 italic">
                  — 翻譯生成中...
                </p>
              </div>
            ))
          ) : (
            <p className="text-text-main/40 italic">正在載入文章內容...</p>
          )}
        </div>
      )}

      {/* ── 點擊單字浮動工具列 ───────────────── */}
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
