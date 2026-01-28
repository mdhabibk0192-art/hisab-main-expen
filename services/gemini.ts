
import { GoogleGenAI, Type } from "@google/genai";
import { EntryType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const processNaturalLanguage = async (text: string) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Parse the following text for financial entries: "${text}". 
    Return a JSON array of entries with keys: type (one of: income, expense, bill_paid, bill_unpaid, extra), category (string like 'food', 'salary', 'tea'), amount (number), and notes (string). 
    If a specific date is mentioned, include it as "date" (YYYY-MM-DD), otherwise omit it.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          entries: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: Object.values(EntryType) },
                category: { type: Type.STRING },
                amount: { type: Type.NUMBER },
                notes: { type: Type.STRING },
                date: { type: Type.STRING }
              },
              required: ["type", "category", "amount"]
            }
          }
        }
      }
    }
  });

  try {
    const data = JSON.parse(response.text);
    return data.entries;
  } catch (e) {
    console.error("Failed to parse AI response", e);
    return [];
  }
};

export const getFinancialSummary = async (history: any) => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this financial history and provide a short summary including top spending categories, total savings, and any potential warnings or missing data: ${JSON.stringify(history)}`,
    config: {
      systemInstruction: "You are a concise financial advisor. Provide feedback in friendly bullet points."
    }
  });
  return response.text;
};
