import React, { useState, useEffect } from "react";
import { ProductAnalysis } from "../types";
import { Sparkles, Palette, Tag, AlignLeft, Check, Plus, Trash2, HelpCircle } from "lucide-react";

interface AnalysisPanelProps {
  analysis: ProductAnalysis | null;
  onChange: (updated: ProductAnalysis) => void;
  isAnalyzing: boolean;
}

export default function AnalysisPanel({
  analysis,
  onChange,
  isAnalyzing,
}: AnalysisPanelProps) {
  const [newColor, setNewColor] = useState("");
  const [newFeature, setNewFeature] = useState("");

  if (!analysis) {
    return (
      <div id="empty-analysis-panel" className="bg-white border border-brand-200/60 rounded-2xl p-6 h-full flex flex-col items-center justify-center text-center text-gray-500">
        <Sparkles className="h-8 w-8 text-brand-200 mb-3 animate-pulse" />
        <h3 className="font-display font-medium text-brand-900 text-sm mb-1">Product Analysis Panel</h3>
        <p className="text-xs text-gray-400 max-w-xs">
          Upload a product photo on the left. Gemini will automatically extract visual attributes and write an optimized studio reconstruction description.
        </p>
      </div>
    );
  }

  const handleUpdateField = (key: keyof ProductAnalysis, value: any) => {
    onChange({
      ...analysis,
      [key]: value,
    });
  };

  const handleAddColor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newColor.trim() && !analysis.colors.includes(newColor.trim())) {
      handleUpdateField("colors", [...analysis.colors, newColor.trim()]);
      setNewColor("");
    }
  };

  const handleRemoveColor = (colorToRemove: string) => {
    const filtered = analysis.colors.filter((c) => c !== colorToRemove);
    handleUpdateField("colors", filtered);
  };

  const handleAddFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeature.trim() && !analysis.dominantFeatures.includes(newFeature.trim())) {
      handleUpdateField("dominantFeatures", [...analysis.dominantFeatures, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (featToRemove: string) => {
    const filtered = analysis.dominantFeatures.filter((f) => f !== featToRemove);
    handleUpdateField("dominantFeatures", filtered);
  };

  return (
    <div id="active-analysis-panel" className="bg-white border border-brand-200 rounded-2xl p-5 shadow-xs flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-brand-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1 px-2.5 bg-brand-500 text-white text-[10px] uppercase tracking-wider font-semibold rounded-md flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Gemini Scan
          </div>
          <h2 className="font-display font-semibold text-brand-900 text-base">Product Attributes</h2>
        </div>
        <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-medium flex items-center gap-1">
          <Check className="h-2.5 w-2.5" /> Ready
        </span>
      </div>

      <div className="space-y-4 flex-1">
        {/* Product Identity */}
        <div className="grid grid-cols-2 gap-3" id="analysis-identity-grid">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Product Name
            </label>
            <input
              type="text"
              value={analysis.name}
              onChange={(e) => handleUpdateField("name", e.target.value)}
              className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500 text-ellipsis"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={analysis.brand || ""}
              onChange={(e) => handleUpdateField("brand", e.target.value)}
              placeholder="e.g. Unknown Brand"
              className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500 text-ellipsis"
            />
          </div>
        </div>

        {/* Category & Material */}
        <div className="grid grid-cols-2 gap-3" id="analysis-category-grid">
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Category
            </label>
            <input
              type="text"
              value={analysis.category || ""}
              onChange={(e) => handleUpdateField("category", e.target.value)}
              placeholder="e.g. Cosmetics"
              className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500 text-ellipsis"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
              Primary Material
            </label>
            <input
              type="text"
              value={analysis.material || ""}
              onChange={(e) => handleUpdateField("material", e.target.value)}
              placeholder="e.g. Glass / Matte"
              className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500 text-ellipsis"
            />
          </div>
        </div>

        {/* Color Palette */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            <Palette className="h-3.5 w-3.5" />
            Detected Colors
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2 h-auto max-h-[80px] overflow-y-auto p-1 bg-brand-100/20 rounded-lg border border-brand-100">
            {analysis.colors.map((color, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-white text-brand-900 border border-brand-200 px-2.5 py-0.5 rounded-full"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-gray-200 shadow-2xs"
                  style={{ backgroundColor: color.toLowerCase() }}
                ></span>
                {color}
                <button
                  type="button"
                  onClick={() => handleRemoveColor(color)}
                  className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
            {analysis.colors.length === 0 && (
              <span className="text-[11px] text-gray-400 italic p-1">No colors specified</span>
            )}
          </div>
          <form onSubmit={handleAddColor} className="flex gap-1.5">
            <input
              type="text"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              placeholder="Add custom color"
              className="flex-1 text-[11px] bg-white border border-brand-200/80 rounded-lg p-1.5 px-2.5 focus:outline-hidden focus:border-brand-500 text-brand-900"
            />
            <button
              type="submit"
              className="p-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Dominant Features */}
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            <Tag className="h-3.5 w-3.5" />
            Distinctive Features
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2 h-auto max-h-[100px] overflow-y-auto p-1 bg-brand-100/20 rounded-lg border border-brand-100">
            {analysis.dominantFeatures.map((feat, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[11px] font-medium bg-brand-100/50 text-brand-900 px-2 py-0.5 rounded-md"
              >
                {feat}
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(feat)}
                  className="text-gray-400 hover:text-red-500 ml-1 cursor-pointer"
                >
                  &times;
                </button>
              </span>
            ))}
            {analysis.dominantFeatures.length === 0 && (
              <span className="text-[11px] text-gray-400 italic p-1 text-center w-full">No features specified</span>
            )}
          </div>
          <form onSubmit={handleAddFeature} className="flex gap-1.5">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="e.g. Golden embossed lid"
              className="flex-1 text-[11px] bg-white border border-brand-200/80 rounded-lg p-1.5 px-2.5 focus:outline-hidden focus:border-brand-500 text-brand-900"
            />
            <button
              type="submit"
              className="p-1.5 bg-brand-100 hover:bg-brand-200 text-brand-900 rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>

        {/* Visual Studio Description */}
        <div className="flex-1 flex flex-col min-h-[120px]">
          <div className="flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1.5">
            <div className="flex items-center gap-1.5">
              <AlignLeft className="h-3.5 w-3.5" />
              AI Prompt Reconstruction
            </div>
            <div className="relative group flex items-center">
              <HelpCircle className="h-3.5 w-3.5 text-gray-300 hover:text-brand-500 cursor-help" />
              <div className="absolute right-0 bottom-full mb-1 w-48 p-2 bg-brand-900 text-white rounded text-[10px] leading-relaxed hidden group-hover:block z-10 shadow-lg font-normal">
                This physical description keeps the product replica highly accurate across different lifestyle setups.
              </div>
            </div>
          </div>
          <textarea
            value={analysis.description}
            onChange={(e) => handleUpdateField("description", e.target.value)}
            className="flex-1 w-full text-xs leading-relaxed text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2.5 focus:outline-hidden focus:border-brand-500 resize-none font-sans min-h-[100px]"
            placeholder="Type visual properties..."
          />
        </div>

        {/* eCommerce Profile */}
        <div className="pt-3 mt-3 border-t border-brand-100 space-y-4">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">
            <Tag className="h-3.5 w-3.5" />
            eCommerce Profile
          </div>
          
          <div>
             <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">
               Short Description
             </label>
             <textarea
               value={analysis.shortDescription || ""}
               onChange={(e) => handleUpdateField("shortDescription", e.target.value)}
               className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500 min-h-[60px]"
             />
          </div>

          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2">
               <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Tags</label>
               <input
                 type="text"
                 value={analysis.tags || ""}
                 onChange={(e) => handleUpdateField("tags", e.target.value)}
                 className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500"
               />
             </div>
             <div>
               <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Product Type</label>
               <input
                 type="text"
                 value={analysis.productType || ""}
                 onChange={(e) => handleUpdateField("productType", e.target.value)}
                 className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500"
               />
             </div>
             <div>
               <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Weight (lbs)</label>
               <input
                 type="text"
                 value={analysis.weightLbs || ""}
                 onChange={(e) => handleUpdateField("weightLbs", e.target.value)}
                 className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500"
               />
             </div>
             <div className="col-span-2 grid grid-cols-3 gap-2">
               <div>
                 <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Length (in)</label>
                 <input
                   type="text"
                   value={analysis.lengthIn || ""}
                   onChange={(e) => handleUpdateField("lengthIn", e.target.value)}
                   className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500"
                 />
               </div>
               <div>
                 <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Width (in)</label>
                 <input
                   type="text"
                   value={analysis.widthIn || ""}
                   onChange={(e) => handleUpdateField("widthIn", e.target.value)}
                   className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500"
                 />
               </div>
               <div>
                 <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-1">Height (in)</label>
                 <input
                   type="text"
                   value={analysis.heightIn || ""}
                   onChange={(e) => handleUpdateField("heightIn", e.target.value)}
                   className="w-full text-xs font-medium text-brand-900 bg-brand-100/30 border border-brand-200/50 rounded-lg p-2 focus:outline-hidden focus:border-brand-500"
                 />
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
