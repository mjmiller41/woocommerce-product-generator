import React, { useState, useEffect, useRef } from "react";
import ProductUploader from "./components/ProductUploader";
import AnalysisPanel from "./components/AnalysisPanel";
import ConfigPanel, { SCENE_PRESETS } from "./components/ConfigPanel";
import GenerationViewer from "./components/GenerationViewer";
import HistorySidebar from "./components/HistorySidebar";
import { getHistory as getIDBHistory, saveHistory as saveIDBHistory, clearHistoryStore } from "./lib/db";
import { exportToCSV } from "./lib/export";
import { checkApiKeyHealth, analyzeProduct, generateLifestyleImage } from "./lib/gemini";
import { ProductAnalysis, LifestyleConfig, HistoryItem } from "./types";
import { 
  Sparkles, AlertTriangle, RefreshCw, Download, Settings, X, Key
} from "lucide-react";

export default function App() {
  // Original Uploaded Product Info
  const [originalImages, setOriginalImages] = useState<{base64: string, mimeType: string}[]>([]);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [preliminaryDescription, setPreliminaryDescription] = useState<string>("");

  // AI-analyzed Attributes state
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Scene Generator Configuration State
  const [config, setConfig] = useState<LifestyleConfig>({
    engine: "image-to-image",
    presetId: "luxury_bath",
    scenePrompt: SCENE_PRESETS[0].prompt,
    lighting: "Golden Hour Warmth",
    aspectRatio: "1:1",
    resolution: "1K",
  });

  // Output Generated Image State
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Progress tracker for batch generation
  const [batchProgress, setBatchProgress] = useState<{current: number, total: number} | null>(null);

  // Credentials connection status
  const [serverHealth, setServerHealth] = useState<{
    connected: boolean;
    hasApiKey: boolean;
    checking: boolean;
  }>({
    connected: true, // Always true since we are client only
    hasApiKey: false,
    checking: true,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");

  // Local History Catalogue
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string>("");

  // Sidebar Resizing State
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const isResizing = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const container = document.getElementById('director-workspace');
      if (container) {
        const rect = container.getBoundingClientRect();
        let newWidth = e.clientX - rect.left;
        if (newWidth < 280) newWidth = 280;
        if (newWidth > 640) newWidth = 640;
        setSidebarWidth(newWidth);
      }
    };
    
    const handleMouseUp = () => {
      if (isResizing.current) {
        isResizing.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const checkHealth = async () => {
    setServerHealth((prev) => ({ ...prev, checking: true }));
    const savedKey = localStorage.getItem("gemini_api_key");
    if (!savedKey) {
      setServerHealth({ connected: true, hasApiKey: false, checking: false });
      return;
    }
    setApiKeyInput(savedKey);
    const valid = await checkApiKeyHealth();
    setServerHealth({ connected: true, hasApiKey: valid, checking: false });
  };

  useEffect(() => {
    checkHealth();
    
    // Load historical sessions from IndexedDB
    getIDBHistory().then((savedHistory) => {
      if (savedHistory && Array.isArray(savedHistory) && savedHistory.length > 0) {
        setHistory(savedHistory);
      } else {
        // Fallback/Migration from LocalStorage initially
        try {
          const saved = localStorage.getItem("lifestyle_history");
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              setHistory(parsed);
              saveIDBHistory(parsed); // Safely persist legacy items to IDB
            }
          }
        } catch (e) {
          console.error("Failed to load legacy creations history", e);
        }
      }
    });
  }, []);

  const saveApiKey = () => {
    localStorage.setItem("gemini_api_key", apiKeyInput);
    setSettingsOpen(false);
    checkHealth();
  };

  const clearApiKey = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKeyInput("");
    setSettingsOpen(false);
    checkHealth();
  }

  // 2. Automated Attribute Analysis Trigger upon Product Upload
  const handleImagesUploaded = async (images: {base64: string, mimeType: string}[]) => {
    if (!images || images.length === 0) return;
    setOriginalImages(images);
    setOriginalImage(images[0].base64); // Display first image as main original
    setAnalysis(null);
    setGeneratedImages([]);
    setGeneratedImage(null);
    setError(null);
    setSelectedHistoryId("");
  };

  // 3. Clear uploading session
  const handleClearSession = () => {
    setOriginalImages([]);
    setOriginalImage(null);
    setPreliminaryDescription("");
    setAnalysis(null);
    setGeneratedImages([]);
    setGeneratedImage(null);
    setError(null);
    setSelectedHistoryId("");
    setBatchProgress(null);
  };

  // 4. Trigger lifestyle scene rendering API (for all uploaded images)
  const handleGenerateLifestyle = async () => {
    if (originalImages.length === 0) return;
    if (!serverHealth.hasApiKey) {
      setError("Please configure your Gemini API Key in the Settings on the top right.");
      setSettingsOpen(true);
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    let currentAnalysis = analysis;
    
    // Step 1: Attribute Generation if missing
    if (!currentAnalysis) {
      setIsAnalyzing(true);
      try {
        currentAnalysis = await analyzeProduct(originalImages, preliminaryDescription);
        setAnalysis(currentAnalysis);
      } catch (err: any) {
        console.error(err);
        setError(`Scanning error: ${err.message || "Failed to process visual layout details."}`);
        setIsAnalyzing(false);
        setIsGenerating(false);
        return;
      }
      setIsAnalyzing(false);
    }
  
    if (!currentAnalysis) {
      setIsGenerating(false);
      return;
    }
    
    let lastGenerated: string | null = null;
    setBatchProgress({ current: 0, total: originalImages.length });
    const generatedImagesArr: string[] = [];

    try {
      for (let i = 0; i < originalImages.length; i++) {
        const img = originalImages[i];
        setBatchProgress({ current: i + 1, total: originalImages.length });
        
        const imageUrl = await generateLifestyleImage(
          config.engine,
          img.base64,
          img.mimeType,
          currentAnalysis.description,
          config.scenePrompt,
          config.lighting,
          config.aspectRatio
        );

        lastGenerated = imageUrl;
        generatedImagesArr.push(imageUrl);
      }

      if (lastGenerated) {
        setGeneratedImage(lastGenerated);
        setGeneratedImages(generatedImagesArr);
      }
      
      const newHistoryItem: HistoryItem = {
        id: `creation_${Date.now()}`,
        originalImages: originalImages,
        originalImage: originalImages[0].base64,
        originalMime: originalImages[0].mimeType,
        analysis: currentAnalysis,
        generatedImages: generatedImagesArr,
        generatedImage: lastGenerated || "",
        config: { ...config },
        preliminaryDescription,
        createdAt: new Date().toISOString(),
      };

      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      
      saveIDBHistory(updatedHistory).catch(e => console.error("Failed to save history:", e));
      setSelectedHistoryId(newHistoryItem.id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during rendering.");
      if (err.message && err.message.includes("GEMINI_API_KEY")) {
        setSettingsOpen(true);
      }
    } finally {
      setIsGenerating(false);
      setBatchProgress(null);
    }
  };

  // 5. Restore historical items
  const handleSelectHistoryItem = (item: HistoryItem) => {
    if (item.originalImages && item.originalImages.length > 0) {
      setOriginalImages(item.originalImages);
    } else {
      setOriginalImages([{ base64: item.originalImage, mimeType: item.originalMime || "image/png"}]);
    }
    setOriginalImage(item.originalImage);
    setAnalysis(item.analysis);
    setGeneratedImages(item.generatedImages || [item.generatedImage]);
    setGeneratedImage(item.generatedImage);
    setConfig(item.config);
    setPreliminaryDescription(item.preliminaryDescription || "");
    setSelectedHistoryId(item.id);
    setError(null);
  };

  // 6. Delete single item from history directory
  const handleClearHistoryItem = (id: string) => {
    const filtered = history.filter((x) => x.id !== id);
    setHistory(filtered);
    saveIDBHistory(filtered).catch(e => console.error("Failed to save history:", e));
    if (selectedHistoryId === id) {
      handleClearSession();
    }
  };

  // 7. Wipe entire catalog history
  const handleClearAllHistory = () => {
    if (confirm("Are you sure you want to clear your entire creation history?")) {
      setHistory([]);
      clearHistoryStore().catch(e => console.error("Failed to clear history:", e));
      localStorage.removeItem("lifestyle_history");
      handleClearSession();
    }
  };

  return (
    <div id="applet-viewport" className="min-h-screen bg-brand-50/50 text-neutral-800 flex flex-col font-sans selection:bg-brand-100 selection:text-brand-900 leading-normal">
      
      {/* 1. Header Banner */}
      <header id="core-header" className="bg-white border-b border-brand-200 py-4 px-8 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center shrink-0">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
            <div>
              <h1 className="font-display font-semibold text-brand-900 text-lg tracking-tight leading-none">
                Ambient Studio AI
              </h1>
              <p className="text-[11px] text-gray-400 mt-1 font-medium leading-none flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-black animate-pulse" />
                Product Lifestyle Image Generator
              </p>
            </div>
          </div>

          {/* Connection Secret Credentials notice status */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportToCSV(history)}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg p-1.5 px-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Export Catalog CSV
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg p-1.5 px-3 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              Settings
            </button>

            {serverHealth.checking ? (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-lg p-1.5 px-3">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Validating key...
              </span>
            ) : serverHealth.hasApiKey ? (
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 px-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Key Valid
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-1.5 px-3 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                  Missing API Secret
                </span>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-brand-200 w-full max-w-md overflow-hidden relative">
            <div className="flex items-center justify-between p-4 border-b border-brand-100 bg-gray-50/50">
              <h3 className="font-display font-semibold text-brand-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-brand-600" />
                API Configuration
              </h3>
              <button 
                onClick={() => setSettingsOpen(false)}
                className="p-1 hover:bg-gray-200 rounded-md text-gray-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full text-sm font-medium text-brand-900 bg-white border border-brand-200 rounded-lg p-2.5 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your key is stored securely in your browser's local storage and is never sent to our servers. It is used directly to communicate with Google's API to generate attributes and lifestyle scenes.
                </p>
                <p className="text-xs text-amber-600 mt-1.5">
                  <strong>Important:</strong> You must have a Paid Billing Key for Imagen generation to work.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-brand-100 flex items-center justify-between bg-gray-50/50">
              <button
                onClick={clearApiKey}
                className="text-xs font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
              >
                Clear Key
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setSettingsOpen(false)}
                  className="text-xs font-medium text-gray-600 hover:text-gray-900 px-4 py-2 border border-gray-200 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveApiKey}
                  className="text-xs font-medium text-white px-4 py-2 rounded-lg bg-brand-900 hover:bg-brand-800 shadow-sm transition-colors cursor-pointer"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Alert notices for missing API key */}
      {!serverHealth.checking && !serverHealth.hasApiKey && (
        <div id="key-warning-notice" className="bg-amber-50 border-b border-amber-200 text-amber-900 py-3 px-6 animate-fade-in-up">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <p className="leading-relaxed font-medium">
              ⚠️ <strong>Gemini API Key Required:</strong> To begin generating beautiful lifestyle mockups, please set up your Gemini credentials by clicking <strong>Settings</strong> in the top right.
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSettingsOpen(true)}
                className="font-bold underline text-amber-800 hover:text-amber-950 flex items-center gap-1.5 cursor-pointer"
              >
                Open Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Core Workspace Dashboard */}
      <div id="director-workspace" className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-[1280px] w-full mx-auto bg-[#fcfcfc] lg:border-x border-gray-200">
        
        {/* Left Sidebar Controls */}
        <aside 
          className="bg-white p-4 lg:p-6 flex flex-col gap-6 shrink-0 overflow-y-auto hidden lg:flex"
          style={{ width: sidebarWidth, minWidth: sidebarWidth }}
        >
          <div>
            <ProductUploader
              onImagesSelected={handleImagesUploaded}
              originalImages={originalImages}
              originalImage={originalImage}
              onClear={handleClearSession}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {originalImages.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Preliminary Description</label>
              <textarea
                value={preliminaryDescription}
                onChange={(e) => setPreliminaryDescription(e.target.value)}
                placeholder="Give a brief description of the product in the images..."
                className="w-full text-xs text-brand-900 bg-white border border-brand-200 rounded-lg p-2.5 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[80px]"
                disabled={isAnalyzing || isGenerating}
              />
            </div>
          )}

          <div>
            <ConfigPanel
              config={config}
              onChange={setConfig}
              onGenerate={handleGenerateLifestyle}
              disabled={isGenerating || isAnalyzing || originalImages.length === 0}
              hasProductAnalyzed={!!analysis}
            />
          </div>
        </aside>

        {/* Resizer Handle */}
        <div 
          className="w-1.5 hover:w-2 bg-transparent hover:bg-brand-200 cursor-col-resize z-10 hidden lg:block border-r border-gray-200/80 -ml-[1px] transition-all"
          onMouseDown={handleMouseDown}
        />

        {/* Main Canvas Context */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 flex flex-col gap-6 bg-[#fcfcfc] overflow-y-auto">
          
          {/* Mobile controls fallback */}
          <div className="lg:hidden flex flex-col sm:flex-row gap-6 mb-2">
            <div className="flex-1 min-h-[300px] flex flex-col gap-4">
              <ProductUploader
                onImagesSelected={handleImagesUploaded}
                originalImages={originalImages}
                originalImage={originalImage}
                onClear={handleClearSession}
                isAnalyzing={isAnalyzing}
              />
              
              {originalImages.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 uppercase tracking-wider mb-2">Preliminary Description</label>
                  <textarea
                    value={preliminaryDescription}
                    onChange={(e) => setPreliminaryDescription(e.target.value)}
                    placeholder="Give a brief description of the product in the images..."
                    className="w-full text-xs text-brand-900 bg-white border border-brand-200 rounded-lg p-2.5 focus:outline-hidden focus:border-brand-500 focus:ring-1 focus:ring-brand-500 min-h-[80px]"
                    disabled={isAnalyzing || isGenerating}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 min-h-[300px]">
              <ConfigPanel
                config={config}
                onChange={setConfig}
                onGenerate={handleGenerateLifestyle}
                disabled={isGenerating || isAnalyzing || originalImages.length === 0}
                hasProductAnalyzed={!!analysis}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 lg:mt-0">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 flex items-center gap-3">
                Resulting Preview
                {batchProgress && (
                  <span className="text-[11px] font-mono text-brand-600 bg-brand-100/50 px-2.5 py-1 rounded-full">
                    Generating Image {batchProgress.current} of {batchProgress.total}...
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500">
                {!originalImage 
                  ? "Upload a product to begin generating your scene." 
                  : "Product will be seamlessly seamlessly integrated into the selected environment."}
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <GenerationViewer
              originalImages={originalImages.map(img => img.base64)}
              generatedImages={generatedImages}
              originalImage={originalImage}
              generatedImage={generatedImage}
              isGenerating={isGenerating}
              error={error}
              onRegenerate={handleGenerateLifestyle}
              aspectRatio={config.aspectRatio}
            />
          </div>

          <div className="mt-8">
            <h3 className="font-semibold text-lg tracking-tight text-gray-900 mb-4">Analysis & Parameters</h3>
            <AnalysisPanel
              analysis={analysis}
              onChange={setAnalysis}
              isAnalyzing={isAnalyzing}
            />
          </div>

          <div className="mt-8">
             <h3 className="font-semibold text-lg tracking-tight text-gray-900 mb-4">Historical Scenes</h3>
             <div className="bg-white border border-brand-200 rounded-2xl p-4 min-h-[300px]">
               <HistorySidebar
                 items={history}
                 onSelectItem={handleSelectHistoryItem}
                 onClearItem={handleClearHistoryItem}
                 onClearAll={handleClearAllHistory}
                 activeId={selectedHistoryId}
               />
             </div>
          </div>

        </main>
      </div>

      {/* 4. Footer */}
      <footer id="app-footer" className="mt-auto border-t border-brand-100 bg-white py-4 text-center">
        <p className="text-[10px] text-gray-400 font-medium">
          Product Lifestyle Image Generator • Built using Google Gemini AI and Imagen Models
        </p>
      </footer>

    </div>
  );
}
