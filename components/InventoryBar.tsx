"use client";

import { useState } from "react";
import { COLLECTIBLE_OBJECTS } from "@/data/house";

interface InventoryBarProps {
  collectedObjectIds: string[];
  onSelectObject: (objectId: string) => void;
}

export default function InventoryBar({
  collectedObjectIds,
  onSelectObject,
}: InventoryBarProps) {
  const [showCatModal, setShowCatModal] = useState(false);

  const totalPossible = Object.keys(COLLECTIBLE_OBJECTS).length;
  const count = collectedObjectIds.length;
  const isUnlocked = count >= 4;

  return (
    <>
      {/* Floating Bottom HUD matching Panel 2 */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[92vw]">
        <div className="bg-[#181613]/95 text-[#F4F1EA] border-2 border-[#383228] px-4 py-2.5 rounded-full shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-3 sm:gap-5">
          
          {/* Counter Label */}
          <div className="font-mono text-[10px] sm:text-xs uppercase tracking-wider text-white/70 whitespace-nowrap flex items-center gap-2">
            <span className="text-[#FFDE82] font-bold">OBJECTS FOUND</span>
            <span className="font-bold text-white bg-[#2B261F] px-2 py-0.5 rounded-md border border-white/10">
              {count} / {totalPossible}
            </span>
          </div>

          {/* Slots Tray */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[200px] sm:max-w-[320px] py-1">
            {collectedObjectIds.map((id) => {
              const obj = COLLECTIBLE_OBJECTS[id];
              if (!obj) return null;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectObject(id)}
                  title={`${obj.name} (${obj.roomName})`}
                  className="w-8 h-8 rounded-full bg-[#29241E] border border-[#FFDE82]/40 flex items-center justify-center text-xs hover:scale-110 hover:border-[#FFDE82] transition-transform flex-shrink-0"
                >
                  {obj.svgIcon === "laptop" && "💻"}
                  {obj.svgIcon === "notebook" && "📓"}
                  {obj.svgIcon === "map" && "🗺️"}
                  {obj.svgIcon === "book" && "📖"}
                  {obj.svgIcon === "pen" && "✒️"}
                  {obj.svgIcon === "reel" && "🎞️"}
                  {obj.svgIcon === "waveform" && "🌊"}
                  {obj.svgIcon === "camera" && "📷"}
                  {obj.svgIcon === "paper" && "🕊️"}
                  {obj.svgIcon === "key" && "🗝️"}
                  {obj.svgIcon === "grid" && "📐"}
                </button>
              );
            })}

            {/* Empty slots placeholders if count < 4 */}
            {Array.from({ length: Math.max(0, 4 - count) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-7 h-7 rounded-full border border-dashed border-white/15 flex items-center justify-center font-mono text-[9px] text-white/20 flex-shrink-0"
              >
                &middot;
              </div>
            ))}
          </div>

          {/* Cat Reward Button if unlocked */}
          {isUnlocked && (
            <button
              type="button"
              onClick={() => setShowCatModal(true)}
              className="px-2.5 py-1 rounded-full bg-[#FFDE82] text-[#1A1918] font-mono text-[10px] font-bold uppercase tracking-wider hover:bg-[#FFEAB2] transition-colors flex items-center gap-1 whitespace-nowrap shadow-md animate-pulse"
            >
              <span>🐱 Cat Unlocked!</span>
            </button>
          )}

        </div>
      </div>

      {/* Cat Reward Easter Egg Modal (Panel 6 of reference) */}
      {showCatModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={() => setShowCatModal(false)}
        >
          <div
            className="relative w-full max-w-sm bg-[#1A1815] text-[#F4F1EA] border-2 border-[#FFDE82] rounded-2xl p-6 shadow-2xl text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowCatModal(false)}
              className="absolute top-3 right-3 text-white/60 hover:text-white font-mono text-sm w-7 h-7 rounded-full border border-white/20 flex items-center justify-center"
            >
              &times;
            </button>

            {/* Cat Heading */}
            <div className="space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFDE82] font-bold block">
                House Mystery Solved
              </span>
              <h3 className="font-serif text-2xl font-medium tracking-tight">
                You&rsquo;ve found enough objects.
              </h3>
              <p className="font-serif italic text-xs text-white/70">
                A familiar face appears from beneath the studio table...
              </p>
            </div>

            {/* Cat Illustration / Representation */}
            <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-[#FFDE82]/40 bg-[#26221B] flex flex-col items-center justify-center p-4">
              <svg viewBox="0 0 100 100" className="w-32 h-32 fill-none stroke-[#FFDE82]" strokeWidth="2">
                {/* Cat face outline */}
                <path d="M 25 35 L 20 15 L 40 25 Q 50 20 60 25 L 80 15 L 75 35 Q 85 55 75 75 Q 50 90 25 75 Q 15 55 25 35 Z" fill="#2E2820" />
                {/* Cat eyes */}
                <ellipse cx="38" cy="48" rx="6" ry="8" fill="#FFDE82" />
                <ellipse cx="62" cy="48" rx="6" ry="8" fill="#FFDE82" />
                <circle cx="38" cy="48" r="3" fill="#1A1815" />
                <circle cx="62" cy="48" r="3" fill="#1A1815" />
                {/* Cat nose & mouth */}
                <polygon points="50,60 46,56 54,56" fill="#F48FB1" stroke="none" />
                <path d="M 50 60 Q 46 67 40 65" />
                <path d="M 50 60 Q 54 67 60 65" />
                {/* Whiskers */}
                <line x1="30" y1="58" x2="10" y2="54" strokeWidth="1.5" />
                <line x1="30" y1="62" x2="10" y2="64" strokeWidth="1.5" />
                <line x1="70" y1="58" x2="90" y2="54" strokeWidth="1.5" />
                <line x1="70" y1="62" x2="90" y2="64" strokeWidth="1.5" />
              </svg>
              <span className="font-serif italic text-sm text-[#FFDE82] mt-2 block">
                The Studio Companion
              </span>
              <span className="font-mono text-[10px] text-white/60">
                Guardian of the House &middot; Curious Observer
              </span>
            </div>

            <p className="text-xs text-white/70 font-sans leading-relaxed">
              Thank you for wandering through my house and looking closer at the work.
            </p>

            <button
              type="button"
              onClick={() => setShowCatModal(false)}
              className="w-full py-2.5 rounded-lg bg-[#FFDE82] text-[#1A1918] font-mono text-xs font-bold uppercase tracking-wider hover:bg-[#FFEAB2] transition-colors"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </>
  );
}
