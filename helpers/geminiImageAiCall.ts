import { GoogleGenAI } from "@google/genai";
import { checkTokenBalance, hasSufficientBalance } from "./tokenBalanceChecker";
import { deductTokens } from "./deductTokens";
// import * as fs from "node:fs";

const IMAGE_COST_IN_TOKENS = 2000;

interface TokenTransactionResult {
  success: boolean;
  remainingTokens?: number;
  cost?: number;
  error?: string;
  data?: any;
}

// export async function geminiImageAiCall(prompt: string) {

//   const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
//   console.log('prompt', prompt)
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash-image",
//     contents: prompt,
//   });
//   for (const part of response.candidates[0].content.parts) {
//     if (part.text) {
//       console.log(part.text);
//       // { aiQuestion: part.text }
//     } else if (part.inlineData) {
//       const imageData = part.inlineData.data;
//       const buffer = Buffer.from(imageData, "base64");
//       const type = 'image/png';
//       const blob = new Blob([buffer as BlobPart], { type });

//       return { blob, imageData };
//     }
//   }
// }

export async function geminiImageAiCallWithTracking(prompt: string, userId: string, setTokenBalance: React.Dispatch<React.SetStateAction<number>>): Promise<TokenTransactionResult> {

  const canProceed = await hasSufficientBalance(userId, IMAGE_COST_IN_TOKENS);
  if (!canProceed) {
    return { success: false, error: "Insufficient tokens for image generation." };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
    // const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });
    // const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-image" });

    // const response = await model.generateContent(prompt);

    let resultData = null;

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        // @ts-ignore
        const buffer = Buffer.from(imageData, "base64");
        const type = 'image/png';
        const blob = new Blob([buffer as BlobPart], { type });
        resultData = { blob, imageData };
        break;
      }
    }

    if (!resultData) {
      throw new Error("No image data generated");
    }

    await deductTokens(userId, IMAGE_COST_IN_TOKENS);

    const tokenBalance = await checkTokenBalance(userId)

    setTokenBalance(tokenBalance)

    return {
      success: true,
      data: resultData,
      cost: IMAGE_COST_IN_TOKENS
    };

  } catch (error: any) {
    console.error("Image Gen Error:", error);
    return { success: false, error: error.message };
  }
}
