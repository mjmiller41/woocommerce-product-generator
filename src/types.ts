export interface ProductAnalysis {
  name: string;
  category?: string;
  brand?: string;
  colors: string[];
  dominantFeatures: string[];
  material?: string;
  description: string;
  shortDescription?: string;
  productType?: string;
  tags?: string;
  weightLbs?: string;
  lengthIn?: string;
  widthIn?: string;
  heightIn?: string;
}

export type GenerationEngine = "image-to-image" | "text-to-image";

export interface LifestyleConfig {
  engine: GenerationEngine;
  presetId: string;
  scenePrompt: string; // The active text description
  lighting: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "16:9" | "9:16";
  resolution: "512px" | "1K" | "2K";
}

export interface HistoryItem {
  id: string;
  originalImages?: { base64: string; mimeType: string }[];
  originalImage: string; // base64/main
  originalMime: string;
  analysis: ProductAnalysis;
  generatedImages?: string[];
  generatedImage: string; // base64 / URL main
  config: LifestyleConfig;
  preliminaryDescription?: string;
  createdAt: string;
}
