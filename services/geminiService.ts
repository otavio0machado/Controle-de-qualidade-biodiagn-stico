import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

const getAIClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateImage = async (prompt: string, size: ImageSize = ImageSize.SIZE_1K) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });
  
  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("No image generated");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};

export const editImage = async (base64Image: string, prompt: string, mimeType: string = 'image/png') => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image', // "Nano banana"
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
  });

  if (!response.candidates?.[0]?.content?.parts) {
    throw new Error("No edited image generated");
  }

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data found in response");
};