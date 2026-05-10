import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export async function translateText(text: string) {
  if (!process.env.GEMINI_API_KEY) return `[Mock Translation] ${text}`;

  const prompt = `Translate the following English news text into Traditional Chinese (Taiwan). Only return the translated text without any explanations.\n\nText: ${text}`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}

export async function translateToBilingual(text: string) {
  if (!process.env.GEMINI_API_KEY) {
    return [{ en: text, zh: "[Mock Translation] 這是測試翻譯" }];
  }

  const prompt = `
    Analyze the following English news text and split it into meaningful sentences.
    Translate each sentence into Traditional Chinese (Taiwan).
    Return the result ONLY as a JSON array of objects with "en" and "zh" keys.
    
    Example: [{"en": "Hello.", "zh": "你好。"}]
    
    Text: ${text}
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  try {
    // 移除 AI 可能包含的 ```json ... ``` 標記
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedJson);
  } catch (e) {
    console.error("Failed to parse bilingual JSON", responseText);
    return [{ en: text, zh: responseText }];
  }
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
