import { GoogleGenAI, Type } from "@google/genai";
import { ProductAnalysis } from "../types";

const getGeminiClient = () => {
  const key = localStorage.getItem("gemini_api_key");
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured in local storage. Please add your key.");
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
      // Note: we might encounter CORS issues making direct REST calls if the API doesn't support them from the browser,
      // but the genai SDK handles browser calls internally via REST endpoint if allowed, though CORS is typically enabled on generative languge APIs.
    },
  });
};

export const checkApiKeyHealth = async (): Promise<boolean> => {
  try {
    const ai = getGeminiClient();
    // A lightweight check
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Hi"
    });
    return !!response.text;
  } catch (err: any) {
    console.error("Health check failed", err);
    return false;
  }
};

export const analyzeProduct = async (
  images: {base64: string, mimeType: string}[], 
  preliminaryDescription?: string
): Promise<ProductAnalysis> => {
  const ai = getGeminiClient();

  const inlineDataParts = images.map((img) => {
    let rawBase64 = img.base64;
    if (rawBase64.includes(";base64,")) {
      rawBase64 = rawBase64.split(";base64,")[1];
    }
    return {
      inlineData: {
        data: rawBase64,
        mimeType: img.mimeType || "image/png"
      }
    };
  });

  let promptMessage = 
    "Identify and analyze this product in detail using the provided images. Provide an accurate and objective assessment of are there " +
    "any branding/labels, color palette, materials, distinct design elements, shape, and physical texture. " +
    "Also generate standard e-commerce product attributes as they would be found in a WooCommerce CSV import file, " +
    "including 'Name', 'Short Description', 'Description', 'Categories' (e.g. 'Clothing > Tshirts', 'Decor', etc), " +
    "'Tags', 'Weight (lbs)', 'Length (in)', 'Width (in)', 'Height (in)', 'Material', and 'Product Type' based on standard " +
    "approximations for this visual item from an online store catalog.";

  if (preliminaryDescription) {
    promptMessage += `\n\nPreliminary Description from the user to assist in identification: "${preliminaryDescription}"`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [
      {
        parts: [
          ...inlineDataParts,
          { text: promptMessage }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          category: { type: Type.STRING },
          shortDescription: { type: Type.STRING },
          tags: { type: Type.STRING },
          weightLbs: { type: Type.STRING },
          lengthIn: { type: Type.STRING },
          widthIn: { type: Type.STRING },
          heightIn: { type: Type.STRING },
          productType: { type: Type.STRING },
          brand: { type: Type.STRING },
          colors: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          dominantFeatures: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          material: { type: Type.STRING },
          description: {
            type: Type.STRING,
            description: "A comprehensive description of the product's appearance, packaging/container shape, labels, exact design, aesthetics, and logo, detailing only the product itself so that we can accurately re-generate it."
          }
        },
        required: ["name", "colors", "dominantFeatures", "description"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response received from product analyzer.");
  }

  return JSON.parse(text.trim());
};

export const generateLifestyleImage = async (
  engine: "image-to-image" | "text-to-image",
  image: string,
  mimeType: string,
  productDescription: string,
  scenePrompt: string,
  lighting: string,
  aspectRatio: string
): Promise<string> => {
  const ai = getGeminiClient();

  if (engine === "text-to-image") {
    // Generate brand new scene with Imagen 4
    const fullPromptText = 
      `High-end professional commercial product advertisement photograph. The main focus is a standalone ${productDescription || "premium product"}. ` +
      `The product is placed realistically in this stunning ambient lifestyle setting: ${scenePrompt}. ` +
      `The atmosphere is beautifully styled with ${lighting || "warm diffused morning sun"} lighting, casting organic and soft shadows. ` +
      `The scene contains matching aesthetic backdrop elements. Shot with a pro studio DSLR camera, shallow depth of field, ` +
      `photorealistic, incredible textures, exquisite material rendering, 8k resolution, commercially ready presentation.`;

    const response = await ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt: fullPromptText,
      config: {
        numberOfImages: 1,
        aspectRatio: aspectRatio || "1:1",
        outputMimeType: "image/jpeg"
      }
    });

    if (!response.generatedImages?.[0]?.image?.imageBytes) {
      throw new Error("Imagen model failed to generate the image.");
    }
    
    return `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}`;

  } else {
    // Smart Placement with Gemini 2.5 Flash Image editing
    let rawBase64 = image;
    if (rawBase64.includes(";base64,")) {
      rawBase64 = rawBase64.split(";base64,")[1];
    }

    const editPromptText = 
      `This is a commercial product photo. Integrate this product naturally and seamlessly into a realistic, ` +
      `fully-realized lifestyle setting: ${scenePrompt}. The overall mood and environment is beautifully lit by ${lighting || "cozy soft morning lights"}. ` +
      `Ensure the product sits realistically on the target surface, casting correct perspective shadows, organic occlusion, ` +
      `and reflecting the ambient lighting of the scene. Preserve the exact colors, writing, label, and shape of the original product ` +
      `without warping or distorting its features. The background should be soft and nicely blurred using a gentle depth-of-field focus (bokeh) ` +
      `to emphasize the product. Output only the final fully-rendered high-quality image.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [
          {
            inlineData: {
              data: rawBase64,
              mimeType: mimeType || "image/png"
            }
          },
          {
            text: editPromptText
          }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio || "1:1"
        }
      }
    });

    let generatedUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          generatedUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!generatedUrl) {
      throw new Error("Product Edit model failed to output a base64 image part.");
    }

    return generatedUrl;
  }
};
