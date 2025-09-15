import { GoogleGenAI, Type } from "@google/genai";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function geminiAiCall(contents: string) {

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            wordMazeArray: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
              },
            },
            text: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
            },
          },
        },

      },
    },
  });
// @ts-ignore
  return JSON.parse(response.text)
}

