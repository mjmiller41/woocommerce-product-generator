import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Download, RefreshCw, Eye, MoveHorizontal, 
  Columns, Smartphone, AlertTriangle 
} from "lucide-react";

interface GenerationViewerProps {
  originalImages?: string[];
  generatedImages?: string[];
  originalImage: string | null;
  generatedImage: string | null;
  isGenerating: boolean;
  error: string | null;
  onRegenerate: () => void;
  aspectRatio: string;
}

const LOADING_STEPS = [
  "Initializing digital studio canvas...",
  "Positioning physical scene props...",
  "Aligning primary softbox spotlights...",
  "Calibrating material texture properties...",
  "Applying soft organic shadows...",
  "Generating realistic specular highlights...",
  "Running commercial color-grading filters...",
  "Rendering final lifestyle frame in 8K...",
];

import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function GenerationViewer({
  originalImages,
  generatedImages,
  originalImage,
  generatedImage,
  isGenerating,
  error,
  onRegenerate,
  aspectRatio,
}: GenerationViewerProps) {
  const [viewMode, setViewMode] = useState<"single" | "swipe" | "grid">("single");
  const [swipePosition, setSwipePosition] = useState(50); // percentage for wipe slider
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Cycle loading messages when generating
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Reset selections if generatedImages changes
  useEffect(() => {
    setSelectedIndices(new Set());
  }, [generatedImages]);

  // Handle slide/swipe actions
  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSwipePosition(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging.current) {
      handleMove(e.clientX);
    }
  };

  const toggleSelection = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const downloadImages = async () => {
    const imagesToDownload = generatedImages && generatedImages.length > 0
      ? (selectedIndices.size > 0 
          ? [...selectedIndices].map(idx => generatedImages[idx])
          : generatedImages)
      : (generatedImage ? [generatedImage] : []);

    if (imagesToDownload.length === 0) return;

    if (imagesToDownload.length === 1) {
      const link = document.createElement("a");
      link.href = imagesToDownload[0];
      link.download = `product-lifestyle-${aspectRatio.replace(":", "x")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const zip = new JSZip();
      
      const promises = imagesToDownload.map(async (dataUrl, i) => {
        // Strip the data:image/png;base64, part if present
        let base64Data = dataUrl;
        if (base64Data.includes(";base64,")) {
          base64Data = base64Data.split(";base64,")[1];
        }
        zip.file(`product-lifestyle-${i + 1}.png`, base64Data, { base64: true });
      });

      await Promise.all(promises);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "product-lifestyles.zip");
    }
  };

  // Convert aspect ratio string to tailwind custom sizing rule or fallback
  const getAspectClass = () => {
    switch (aspectRatio) {
      case "1:1": return "aspect-square max-h-[420px]";
      case "16:9": return "aspect-video max-h-[300px]";
      case "9:16": return "aspect-9/16 max-h-[480px] w-[270px]";
      case "4:3": return "aspect-4/3 max-h-[380px]";
      case "3:4": return "aspect-3/4 max-h-[420px] w-[315px]";
      default: return "aspect-square max-h-[400px]";
    }
  };

  return (
    <div id="generation-viewer-root" className="flex flex-col items-center justify-between h-full bg-brand-100/30 rounded-2xl p-6 border border-brand-200">
      
      {/* Top Header Controls (only visible when image is ready) */}
      <div className="w-full flex items-center justify-between mb-4 border-b border-brand-200/50 pb-3 h-auto">
        <h3 className="font-display font-semibold text-brand-900 text-sm flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-brand-500" />
          Studio Display
        </h3>
        
        {generatedImage && !isGenerating && (
          <div id="view-mode-buttons" className="flex bg-white shadow-3xs border border-brand-200/60 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("single")}
              className={`p-1 px-2.5 rounded-md text-[10px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "single"
                  ? "bg-brand-900 text-white"
                  : "text-gray-500 hover:text-brand-900"
              }`}
              title="View full render"
            >
              <Eye className="h-3 w-3" />
              Full Render
            </button>
            <button
              onClick={() => setViewMode("swipe")}
              className={`p-1 px-2.5 rounded-md text-[10px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "swipe"
                  ? "bg-brand-900 text-white"
                  : "text-gray-500 hover:text-brand-900"
              }`}
              title="Swipe split compare"
            >
              <MoveHorizontal className="h-3 w-3" />
              Swipe Wipe
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 px-2.5 rounded-md text-[10px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === "grid"
                  ? "bg-brand-900 text-white"
                  : "text-gray-500 hover:text-brand-900"
              }`}
              title="Side-by-side grid"
            >
              <Columns className="h-3 w-3" />
              Dual Grid
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Viewport */}
      <div className="flex-1 w-full flex items-center justify-center p-2 min-h-[340px]">
        
        {/* State A: Generating loader */}
        {isGenerating && (
          <div id="generating-visual-loader" className="flex flex-col items-center justify-center max-w-sm text-center p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-md border border-brand-100 animate-fade-in-up">
            <div className="relative w-16 h-16 mb-5">
              <div className="absolute inset-0 rounded-full border-4 border-brand-100 border-t-brand-900 animate-spin"></div>
              <div className="absolute inset-2.5 rounded-full border-4 border-dashed border-brand-200 border-b-neutral-400 animate-[spin_3s_linear_infinite_reverse]"></div>
              <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-amber-400 animate-pulse" />
            </div>
            
            <h4 className="font-display font-semibold text-brand-900 text-sm mb-1.5">
              Photographer Render Engine
            </h4>
            
            {/* Spinning messages */}
            <p className="text-xs text-brand-500 font-mono font-medium h-5 overflow-hidden animate-pulse">
              {LOADING_STEPS[loadingStepIdx]}
            </p>
            
            {/* Minimal progressive progress bar */}
            <div className="w-48 bg-brand-100 h-1.5 rounded-full overflow-hidden mt-4">
              <div 
                className="bg-brand-900 h-full transition-all duration-500" 
                style={{ width: `${((loadingStepIdx + 1) / LOADING_STEPS.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-gray-400 mt-2">takes approx. 10 - 20 seconds</p>
          </div>
        )}

        {/* State B: Error View */}
        {error && !isGenerating && (
          <div id="error-visual" className="flex flex-col items-center justify-center max-w-sm text-center p-8 bg-white/90 border border-red-100 rounded-2xl shadow-sm">
            <div className="p-3 bg-red-50 text-red-500 rounded-full mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h4 className="font-display font-semibold text-brand-900 text-sm mb-1">
              Rendering Interrupted
            </h4>
            <p className="text-xs text-gray-500 mb-4 leading-normal">
              {error}
            </p>
            <button
              onClick={onRegenerate}
              className="px-4 py-2 bg-brand-900 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              Attempt Re-run
            </button>
          </div>
        )}

        {/* State C: Placeholder view when idle */}
        {!generatedImage && !isGenerating && !error && (
          <div id="idle-viewer-placeholder" className="text-center p-8 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white rounded-full border border-brand-200/50 flex items-center justify-center text-brand-300 md-3 shadow-3xs mb-4">
              <Eye className="h-7 w-7" />
            </div>
            <h4 className="font-display font-semibold text-brand-900 text-sm mb-1">
              Ambient Rendering Stage
            </h4>
            <p className="text-xs text-gray-500 max-w-xs leading-normal">
              {!originalImage 
                ? "First upload your product image on the left. The attributes scanner will initiate instantly." 
                : "Customize your environment scene preset or enter a custom prompt on the right, then hit 'Generate'!"}
            </p>
          </div>
        )}

        {/* State D: Successful generation rendering options */}
        {generatedImage && !isGenerating && !error && (
          <div className="w-full flex items-center justify-center h-full">
            
            {/* Option D1: Single or Gallery layout */}
            {viewMode === "single" && (
              <div 
                className={`w-full max-h-[600px] overflow-y-auto ${generatedImages && generatedImages.length > 1 ? 'grid grid-cols-2 gap-4' : ''}`}
              >
                {(generatedImages && generatedImages.length > 0 ? generatedImages : [generatedImage]).map((img, idx) => {
                  const isSelected = selectedIndices.has(idx);
                  return (
                    <div 
                      key={idx} 
                      className={`relative bg-white shadow-md border rounded-xl overflow-hidden shadow-brand-900/[0.03] animate-fade-in-up cursor-pointer ${generatedImages && generatedImages.length > 1 ? 'aspect-square' : getAspectClass()} ${isSelected ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-brand-200/50 hover:border-brand-400'}`}
                      onClick={() => {
                        if (generatedImages && generatedImages.length > 1) toggleSelection(idx);
                      }}
                    >
                      <img
                        src={img || undefined}
                        alt={`Generated Product Lifestyle ${idx + 1}`}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {generatedImages && generatedImages.length > 1 && (
                        <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full border border-white/50 bg-black/30 backdrop-blur-sm">
                          {isSelected && <div className="w-3 h-3 bg-brand-500 rounded-full" />}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Option D2: Swipe comparison wiping layer */}
            {viewMode === "swipe" && (
              <div 
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className={`relative select-none shadow-md border border-brand-200/50 rounded-xl overflow-hidden cursor-ew-resize select-none bg-brand-200 ${getAspectClass()}`}
              >
                {/* Background image: Original Raw Product centered */}
                <div className="absolute inset-0 bg-white flex items-center justify-center p-8">
                  {originalImage && (
                    <img
                      src={originalImage}
                      alt="Raw Product Backdrop"
                      className="object-contain max-h-[80%] max-w-[80%] drop-shadow-sm"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <span className="absolute bottom-2 left-2 text-[8px] bg-brand-900/60 backdrop-blur-xs text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                    Raw Product
                  </span>
                </div>

                {/* Foreground image: Generated Lifestyle Scene clipped */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    clipPath: `polygon(0 0, ${swipePosition}% 0, ${swipePosition}% 100%, 0 100%)`,
                    backgroundImage: `url(${generatedImage})`
                  }}
                >
                  <span className="absolute bottom-2 right-2 text-[8px] bg-emerald-600/80 backdrop-blur-xs text-white px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                    Lifestyle Scene
                  </span>
                </div>

                {/* Vertical slider divider handle lines */}
                <div 
                  className="absolute bottom-0 top-0 w-0.5 bg-white shadow-md"
                  style={{ left: `${swipePosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white shadow-md text-brand-900 flex items-center justify-center border border-brand-200">
                    <MoveHorizontal className="h-4 w-4" />
                  </div>
                </div>
              </div>
            )}

            {/* Option D3: Side-by-side grid */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl animate-fade-in-up" id="viewer-dual-grid">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-medium text-gray-400 mb-1">RAW SOURCE</span>
                  <div className="flex-1 min-h-[200px] border border-brand-200 bg-white rounded-xl flex items-center justify-center p-4">
                    {originalImage && (
                      <img
                        src={originalImage}
                        alt="Original Product Grid"
                        className="object-contain max-h-[160px] max-w-full"
                        referrerPolicy="no-referrer"
                      />
                    )}
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono font-medium text-brand-500 mb-1">GENERATED STUDIO RENDER</span>
                  <div className="flex-1 min-h-[200px] border border-brand-200 bg-white rounded-xl overflow-hidden relative">
                    <img
                      src={generatedImage}
                      alt="Generated Product Grid"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Downloader Bottom Toolbar actions */}
      {generatedImage && !isGenerating && !error && (
        <div className="w-full mt-4 pt-3 border-t border-brand-200/50 flex grid grid-cols-2 gap-3 h-auto">
          <button
            type="button"
            id="regenerate-btn"
            onClick={onRegenerate}
            className="flex items-center justify-center gap-1.5 bg-white border border-brand-200 hover:border-brand-500 text-brand-900 text-xs font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-shoot
          </button>
          
          <button
            type="button"
            id="download-btn"
            onClick={downloadImages}
            className="flex items-center justify-center gap-1.5 bg-brand-900 hover:bg-brand-600 text-white text-xs font-semibold py-2.5 px-4 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            {((selectedIndices.size > 1) || (selectedIndices.size === 0 && generatedImages && generatedImages.length > 1)) ? "Export Zip" : "Export Image"}
          </button>
        </div>
      )}

    </div>
  );
}
