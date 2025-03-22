import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Initialize Google Gemini API
const genAI = new GoogleGenerativeAI('AIzaSyDvZewm0My72OWrRlSka8SsSEzp1sR4i6c');

export const fetchGeminiResponse = async (question: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: question }] }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.1,
      },
    });

    return result.response.text() || "No response from AI.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
};
