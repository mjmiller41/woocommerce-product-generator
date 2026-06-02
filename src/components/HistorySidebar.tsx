import React from "react";
import { HistoryItem } from "../types";
import { History, Trash2, Clock, Calendar, Compass, Layers } from "lucide-react";

interface HistorySidebarProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClearItem: (id: string) => void;
  onClearAll: () => void;
  activeId: string | undefined;
}

export default function HistorySidebar({
  items,
  onSelectItem,
  onClearItem,
  onClearAll,
  activeId,
}: HistorySidebarProps) {
  if (items.length === 0) {
    return (
      <div id="empty-history-panel" className="bg-white border border-brand-200/60 rounded-2xl p-5 text-center flex flex-col items-center justify-center min-h-[140px] h-full">
        <History className="h-6 w-6 text-brand-200 mb-2" />
        <h4 className="font-display font-medium text-brand-900 text-xs mb-0.5">No Historical Renders</h4>
        <p className="text-[10px] text-gray-400 max-w-[180px] leading-tight">
          Your successfully developed e-commerce lifestyle scenes will appear in this catalog.
        </p>
      </div>
    );
  }

  const formatDate = (isoStr: string) => {
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "Developed";
    }
  };

  return (
    <div id="active-history-panel" className="bg-white border border-brand-200 rounded-2xl p-4 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between pb-3 border-b border-brand-100 mb-3 h-auto">
        <div className="flex items-center gap-1.5 text-brand-900">
          <History className="h-4 w-4" />
          <h3 className="font-display font-semibold text-xs uppercase tracking-wider">Catalog History</h3>
          <span className="text-[10px] bg-brand-100 text-brand-500 font-bold px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onClearAll}
          className="text-[10px] text-gray-400 hover:text-red-500 font-medium cursor-pointer transition-colors"
          title="Clear all creations"
        >
          Clear All
        </button>
      </div>

      {/* Vertical list of thumbs */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1" id="history-items-list">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <div
              key={item.id}
              className={`group relative flex items-center gap-3 p-2 rounded-xl border transition-all text-left overflow-hidden cursor-pointer ${
                isActive
                  ? "bg-brand-100/60 border-brand-500 shadow-3xs"
                  : "bg-white border-brand-100 hover:border-brand-300 hover:bg-brand-50/20"
              }`}
              onClick={() => onSelectItem(item)}
            >
              {/* Product and setting visual overlap */}
              <div className="relative w-12 h-12 rounded-lg bg-brand-100/20 border border-brand-100 overflow-hidden flex-shrink-0">
                <img
                  src={item.generatedImage}
                  alt={item.analysis.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Overlay tiny circle with original */}
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full border border-white bg-white overflow-hidden shadow-3xs">
                  <img
                    src={item.originalImage}
                    alt="Original Thumb"
                    className="w-full h-full object-contain p-0.5"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="font-display font-semibold text-[11px] text-brand-900 truncate">
                  {item.analysis.name}
                </div>
                <div className="text-[9px] text-gray-500 truncate flex items-center gap-1 mt-0.5">
                  <span className="p-0.5 bg-brand-200/50 text-brand-900 rounded-[3px] font-semibold text-[8px] uppercase leading-none">
                    {item.config.engine === "image-to-image" ? "Edit" : "Pure AI"}
                  </span>
                  <span>{item.config.presetId.replace("_", " ")}</span>
                </div>
                <div className="text-[8px] text-gray-400 mt-0.5 flex items-center gap-1 font-mono">
                  <Clock className="h-2.5 w-2.5" />
                  {formatDate(item.createdAt)}
                </div>
              </div>

              {/* Individual delete item button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearItem(item.id);
                }}
                className="absolute right-2 top-2 p-1 text-gray-300 hover:text-red-500 rounded hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Delete item"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
