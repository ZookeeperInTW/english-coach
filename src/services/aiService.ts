import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function translateText(text: string) {
  if (!process.env.GEMINI_API_KEY) return `[Mock Translation] ${text}`;

  const prompt = `Translate the following English news text into Traditional Chinese (Taiwan). Only return the translated text:\n\n${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function generateSentences(
  word: string
): Promise<{ en: string; zh: string }[]> {
  if (!process.env.GEMINI_API_KEY) {
    return [
      {
        en: `This is a mock sentence for ${word}.`,
        zh: `這是 ${word} 的模擬句子。`,
      },
      {
        en: `${word} is an interesting word.`,
        zh: `${word} 是一個有趣的單字。`,
      },
    ];
  }

  const prompt = `For the English word "${word}", generate 2 natural example sentences in English with their Traditional Chinese (Taiwan) translations. 
  Format the output as a JSON array like this: [{"en": "sentence...", "zh": "翻譯..."}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    // 移除 markdown 代碼塊標籤
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse AI response:", text);
    return [];
  }
}
