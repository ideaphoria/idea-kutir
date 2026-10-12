"use client";

import { CollectibleObject, COLLECTIBLE_OBJECTS } from "@/data/house";

interface ObjectModalProps {
  objectId: string | null;
  onClose: () => void;
  onCollect: (objectId: string) => void;
  onViewConnectedProject: (projectId: string) => void;
  isCollected: boolean;
}

export default function ObjectModal({
  objectId,
  onClose,
  onCollect,
  onViewConnectedProject,
  isCollected,
}: ObjectModalProps) {
  if (!objectId) return null;
  const item: CollectibleObject | undefined = COLLECTIBLE_OBJECTS[objectId];
  if (!item) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="object-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-all"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#1C1A17] text-[#F4F1EA] border-2 border-[#FFDE82]/40 rounded-2xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-white/50 hover:text-white font-mono text-sm w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"
        >
          &times;
        </button>

        {/* Object Icon / Graphic Platter */}
        <div className="flex items-center justify-center pt-2">
          <div className="w-24 h-24 rounded-2xl bg-[#292520] border-2 border-[#FFDE82]/30 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
            <span className="text-3xl">
              {item.svgIcon === "laptop" && "💻"}
              {item.svgIcon === "notebook" && "📓"}
              {item.svgIcon === "map" && "🗺️"}
              {item.svgIcon === "book" && "📖"}
              {item.svgIcon === "pen" && "✒️"}
              {item.svgIcon === "reel" && "🎞️"}
              {item.svgIcon === "waveform" && "🌊"}
              {item.svgIcon === "camera" && "📷"}
              {item.svgIcon === "paper" && "🕊️"}
              {item.svgIcon === "key" && "🗝️"}
              {item.svgIcon === "grid" && "📐"}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-widest text-[#FFDE82]/70 mt-1">
              {item.type}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="text-center space-y-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFDE82] block">
            Discovered in {item.roomName}
          </span>
          <h2 id="object-modal-title" className="font-serif text-2xl sm:text-3xl font-medium tracking-tight">
            {item.name}
          </h2>
          <p className="text-sm text-[#F4F1EA]/80 leading-relaxed font-sans pt-1">
            {item.description}
          </p>
        </div>

        {/* Unlocked Note if collected */}
        {item.unlockedNote && (
          <div className="p-3 rounded-lg bg-[#25221C] border border-[#FFDE82]/20 font-mono text-xs text-[#FFDE82]/90 text-center">
            &ldquo;{item.unlockedNote}&rdquo;
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => onCollect(item.id)}
            disabled={isCollected}
            className={`w-full py-3 rounded-xl font-mono text-xs uppercase tracking-widest transition-all ${
              isCollected
                ? "bg-[#2A261F] text-[#FFDE82] border border-[#FFDE82]/30 cursor-default"
                : "bg-[#FFDE82] text-[#1A1918] hover:bg-[#FFEAB2] shadow-lg font-bold"
            }`}
          >
            {isCollected ? "Collected in Inventory ✓" : "Collect this object"}
          </button>

          {item.connectedProjectId && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onViewConnectedProject(item.connectedProjectId!);
              }}
              className="w-full py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider text-white/70 hover:text-white border border-white/15 hover:border-white/40 transition-colors"
            >
              Inspect {item.connectedProjectTitle} &rarr;
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
