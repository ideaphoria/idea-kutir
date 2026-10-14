"use client";

import React, { useEffect } from "react";
import { HOUSE_OBJECTS_3D, InteractiveObject3D } from "@/data/house3d";

interface InventoryModalProps {
  isOpen: boolean;
  collectedItemIds: Set<string>;
  onClose: () => void;
  onSelectObject: (obj: InteractiveObject3D) => void;
}

export default function InventoryModal({
  isOpen,
  collectedItemIds,
  onClose,
  onSelectObject,
}: InventoryModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "i" || e.key === "I") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const collectedObjects = HOUSE_OBJECTS_3D.filter((obj) =>
    collectedItemIds.has(obj.id)
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 pointer-events-auto select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-black flex flex-col max-h-[94vh]"
      >
        {/* Title Bar */}
        <header className="h-7 sm:h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#000080] to-[#1084d0] text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span>💼</span>
            <span>Idea Kutir — Satchel Archive [I]</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center text-black font-bold text-xs sm:text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close [ESC / I]"
          >
            ✕
          </button>
        </header>

        {/* Stats status bar */}
        <div className="p-2 border-b border-[#808080]/30 bg-[#c0c0c0] flex items-center justify-between text-xs text-black">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-1">
            Collected: <strong>{collectedObjects.length}</strong> / {HOUSE_OBJECTS_3D.length} Specimens
          </div>
          <span className="hidden sm:inline italic text-[11px] text-[#555]">
            Click any artifact to open dossier
          </span>
        </div>

        {/* Body list */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#c0c0c0]">
          {collectedObjects.length === 0 ? (
            <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-8 text-center text-xs text-black">
              <div className="text-3xl mb-2">🕸️</div>
              <div className="font-bold text-sm">Your satchel is empty.</div>
              <div className="text-[#555] mt-1">
                Explore the house rooms and collect artifacts to inspect them here.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {collectedObjects.map((obj) => (
                <div
                  key={obj.id}
                  onClick={() => {
                    onClose();
                    onSelectObject(obj);
                  }}
                  className="group cursor-pointer bg-white hover:bg-[#000080] text-black hover:text-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-2.5 flex flex-col justify-between shadow-sm transition-none"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="flex items-center gap-1">
                        <span>✦</span>
                        <span>{obj.name}</span>
                      </span>
                      <span className="text-[10px] uppercase font-mono group-hover:text-yellow-200 text-[#555]">
                        {obj.type}
                      </span>
                    </div>
                    <div className="text-[11px] line-clamp-2 leading-relaxed group-hover:text-gray-100 text-[#444]">
                      {obj.description}
                    </div>
                  </div>
                  <div className="mt-2 pt-1 border-t border-[#ccc] group-hover:border-white/40 flex items-center justify-between text-[10px]">
                    <span className="uppercase text-[#666] group-hover:text-gray-200">
                      Room: {obj.roomId.replace("_", " ")}
                    </span>
                    <span className="font-bold uppercase text-[#000080] group-hover:text-yellow-300">
                      Open Dossier &rarr;
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-2 border-t border-[#808080]/30 bg-[#c0c0c0] flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 text-xs font-bold text-black bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white min-w-[70px] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
