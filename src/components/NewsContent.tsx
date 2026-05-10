"use client";

import { useState } from "react";

interface BilingualSentence {
  en: string;
  zh: string;
}

interface NewsContentProps {
  contentEn: string;
  contentZh: string;
  contentBilingual?: BilingualSentence[] | null;
}

export default function NewsContent({
  contentEn,
  contentZh,
  contentBilingual,
}: NewsContentProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  const handleWordClick = (word: string) => {
    // 移除標點符號
    const cleanWord = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
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

  // 渲染英文句子（支援點擊單字）
  const renderEnglishSentence = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span
        key={index}
        onClick={() => handleWordClick(word)}
        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 rounded px-0.5 transition-colors"
      >
        {word}{" "}
      </span>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      {contentBilingual && contentBilingual.length > 0 ? (
        // 中英對照模式
        <div className="space-y-12">
          {contentBilingual.map((pair, index) => (
            <div key={index} className="group">
              <p className="text-2xl text-gray-800 leading-relaxed font-serif mb-2">
                {renderEnglishSentence(pair.en)}
              </p>
              <p className="text-xl text-blue-600/80 leading-relaxed font-medium">
                {pair.zh}
              </p>
            </div>
          ))}
        </div>
      ) : (
        // 傳統並排模式（相容舊資料）
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
              English Original
            </h3>
            <div className="text-xl text-gray-800 leading-relaxed font-serif">
              {renderEnglishSentence(contentEn)}
            </div>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-8">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
              中文翻譯
            </h3>
            <p className="text-xl text-gray-600 leading-relaxed">{contentZh}</p>
          </div>
        </div>
      )}

      {/* Word Action Tooltip */}
      {selectedWord && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-blue-100 rounded-full px-8 py-4 flex items-center space-x-6 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
          <span className="text-xl font-bold text-gray-900">
            {selectedWord}
          </span>
          <button
            onClick={() => addToVocab(selectedWord)}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition-colors"
          >
            加入單字庫
          </button>
          <button
            onClick={() => setSelectedWord(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}
