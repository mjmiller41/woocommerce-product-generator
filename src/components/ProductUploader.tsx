import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Trash2, Sparkles } from "lucide-react";

interface ProductUploaderProps {
  onImagesSelected?: (images: {base64: string, mimeType: string}[]) => void;
  // Fallbacks for backwards compatibility if needed, but we'll use onImagesSelected
  onImageSelected?: (base64Data: string, mimeType: string) => void;
  originalImages?: {base64: string, mimeType: string}[];
  originalImage?: string | null;
  onClear: () => void;
  isAnalyzing: boolean;
}

export default function ProductUploader({
  onImagesSelected,
  onImageSelected,
  originalImages = [],
  originalImage,
  onClear,
  isAnalyzing,
}: ProductUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      alert("Please upload valid image files.");
      return;
    }

    const readers = validFiles.map(file => {
      return new Promise<{base64: string, mimeType: string}>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve({ base64: reader.result, mimeType: file.type });
          }
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(results => {
      if (onImagesSelected) {
        onImagesSelected(results);
      } else if (onImageSelected && results.length > 0) {
        onImageSelected(results[0].base64, results[0].mimeType);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const hasImages = (originalImages && originalImages.length > 0) || originalImage;
  const displayImages = originalImages && originalImages.length > 0 
    ? originalImages.map(img => img.base64) 
    : (originalImage ? [originalImage] : []);

  return (
    <div id="uploader-container" className="flex flex-col h-full justify-between">
      {!hasImages ? (
        <div
          id="dropzone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer min-h-[300px] transition-all duration-300 ${
            isDragActive
              ? "border-brand-500 bg-brand-100/50 scale-[0.99]"
              : "border-brand-200 bg-white hover:border-brand-500 hover:bg-brand-50/30"
          }`}
        >
          <input
            id="file-input"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="p-4 bg-brand-100 rounded-full text-brand-500 mb-4 transition-transform duration-300 hover:scale-110">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-display font-semibold text-brand-900 text-lg mb-1">
            Upload Product Photos
          </h3>
          <p className="text-sm text-gray-500 mb-4 max-w-xs">
            Drag & drop your product shots here, or click to browse files
          </p>
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-600 font-medium px-3 py-1.5 bg-brand-100/50 rounded-full">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Auto-analyzed by Gemini AI
          </div>
        </div>
      ) : (
        <div id="preview-container" className="relative group border border-brand-200 bg-brand-50/20 rounded-2xl p-4 flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative w-full overflow-hidden flex flex-wrap gap-2 justify-center">
            {displayImages.map((imgUrl, idx) => (
              <div key={idx} className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white shadow-sm border border-brand-100 overflow-hidden">
                <img
                  src={imgUrl}
                  alt={`Product ${idx+1}`}
                  className="object-contain w-full h-full p-2 transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>

          <div className="w-full mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 text-xs font-mono bg-brand-200/50 text-brand-900 rounded font-semibold flex items-center gap-1.5">
                <ImageIcon className="h-3.5 w-3.5" />
                {displayImages.length} Image{displayImages.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <button
              id="clear-image-btn"
              onClick={onClear}
              disabled={isAnalyzing}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150 disabled:opacity-50"
              title="Remove images"
            >
              <Trash2 className="h-4.5 w-4.5" />
            </button>
          </div>

          {isAnalyzing && (
            <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white p-4 z-10">
              <div className="w-8 h-8 rounded-full border-2 border-brand-200 border-t-white animate-spin mb-3"></div>
              <p className="font-display font-medium text-sm">Gemini is scanning product details...</p>
              <p className="text-xs text-brand-100 mt-1">Analyzing shapes, branding & materials from all images</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
