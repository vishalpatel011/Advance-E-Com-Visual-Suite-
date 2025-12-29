import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

// Helper to safely get the API Key in different environments (Bundler vs Raw Browser)
const getApiKey = (): string => {
  // Vite environment variables only, no fallback
  return import.meta.env.VITE_GEMINI_API_KEY;
};

const API_KEY = getApiKey();

if (!API_KEY) {
  console.error("Missing API KEY. Calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const SYSTEM_INSTRUCTION = `
PERSONA: You are a Lead Creative Director and AI Orchestrator. 

CORE TASK: Analyze the uploaded product image. 
1. SAFETY CHECK: Verify if the image is a commercial product. If it is a person's face, a landscape, or inappropriate content, set is_valid: false.
2. CONTENT GENERATION: If valid, generate:
   - A catchy title and 150-word SEO-optimized description.
   - 3 platform-specific social media captions.
   - A highly detailed 75-word prompt for Imagen 3 (Luxury lifestyle setting).
   - A 5-second cinematic storyboard prompt for Veo 3.1 (Camera movement + lighting).

STRICT OUTPUT FORMAT: Return ONLY a valid JSON object.
`;

export const analyzeProductImage = async (base64Image: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: "Analyze this product image and generate the marketing suite JSON."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_valid: { type: Type.BOOLEAN },
            error_message: { type: Type.STRING, nullable: true },
            product_title: { type: Type.STRING },
            seo_description: { type: Type.STRING },
            social_posts: {
              type: Type.OBJECT,
              properties: {
                instagram: { type: Type.STRING },
                tiktok: { type: Type.STRING },
                facebook: { type: Type.STRING }
              }
            },
            imagen_params: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                aspect_ratio: { type: Type.STRING }
              }
            },
            veo_params: {
              type: Type.OBJECT,
              properties: {
                prompt: { type: Type.STRING },
                aspect_ratio: { type: Type.STRING }
              }
            }
          },
          required: ["is_valid", "product_title", "seo_description", "social_posts", "imagen_params", "veo_params"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from analysis model");
    return JSON.parse(jsonText) as AnalysisResult;
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const generateLifestyleImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    // Valid aspect ratios for gemini-2.5-flash-image are "1:1", "3:4", "4:3", "9:16", "16:9"
    const validRatio = ["1:1", "3:4", "4:3", "9:16", "16:9"].includes(aspectRatio) ? aspectRatio : "1:1";

    // Switch to gemini-2.5-flash-image (Nano Banana) which uses generateContent
    // This fixes the 404 error associated with calling generateImages on models that don't support it or are restricted.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: validRatio,
          // imageSize is only for gemini-3-pro-image-preview
        }
      }
    });

    // Parse the response to find inlineData
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateAdVideo = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    const win = window as any;
    // Veo requires the user to select their own key via the popup if not already done.
    if (win.aistudio && win.aistudio.hasSelectedApiKey) {
      const hasKey = await win.aistudio.hasSelectedApiKey();
      if (!hasKey && win.aistudio.openSelectKey) {
        await win.aistudio.openSelectKey();
      }
    }

    // Always use a fresh instance to capture potentially newly selected keys
    const veoAi = new GoogleGenAI({ apiKey: API_KEY });
    
    // Veo support 16:9 or 9:16
    const validRatio = aspectRatio === "9:16" ? "9:16" : "16:9"; 

    let operation = await veoAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: validRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await veoAi.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed to return a URI");
    
    // Fetch the video content using the API key to handle authentication and CORS
    const videoResponse = await fetch(`${videoUri}&key=${API_KEY}`);
    
    if (!videoResponse.ok) {
        throw new Error(`Failed to download video: ${videoResponse.statusText}`);
    }

    const blob = await videoResponse.blob();
    // Create a local object URL for the <video> tag
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Video Gen Error:", error);
    throw error;
  }
};
