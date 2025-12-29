import { GoogleGenAI, Type } from "@google/genai";
import { deductTokens } from "./deductTokens";
import { checkTokenBalance, hasSufficientBalance } from "./tokenBalanceChecker";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface TokenTransactionResult {
  success: boolean;
  remainingTokens?: number;
  cost?: number;
  error?: string;
  data?: any;
}

const MIN_TEXT_BUFFER = 100

// export async function geminiAiCall(contents: string) {

//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: contents,
//     config: {
//       responseMimeType: "application/json",
//       responseSchema: {
//         type: Type.ARRAY,
//         items: {
//           type: Type.OBJECT,
//           properties: {
//             wordMazeArray: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.ARRAY,
//                 items: {
//                   type: Type.STRING,
//                 },
//               },
//             },
//             text: {
//               type: Type.ARRAY,
//               items: {
//                 type: Type.STRING,
//               },
//             },
//           },
//         },

//       },
//     },
//   });
//   // @ts-ignore
//   return JSON.parse(response.text)
// }

export async function geminiAiCallWithTracking(contents: string, userId: string, setTokenBalance: React.Dispatch<React.SetStateAction<number>>): Promise<TokenTransactionResult> {

  const canProceed = await hasSufficientBalance(userId, MIN_TEXT_BUFFER);
  if (!canProceed) {
    return { success: false, error: "Insufficient tokens. Please top up." };
  }

  try {
    // const ai = new GoogleGenAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const model = {
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
                items: { type: Type.STRING },
              },
            },
          },
        },
      },
    };

    const result = await ai.models.generateContent(model);
    // const response = await result.response;

    const usage = result.usageMetadata;
    const totalTokensUsed = usage?.totalTokenCount || 0;
    // @ts-ignore
    const parsedData = JSON.parse(result.text);

    if (totalTokensUsed > 0) {
      await deductTokens(userId, totalTokensUsed);

      const tokenBalance = await checkTokenBalance(userId)

      setTokenBalance(tokenBalance)
    }

    return {
      success: true,
      data: parsedData,
      cost: totalTokensUsed
    };

  } catch (error: any) {
    console.error("Text Gen Error:", error);
    return { success: false, error: error.message };
  }
}