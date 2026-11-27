"use client";

import React from "react";

export interface ModeToggleProps {
  mode: "wander" | "work";
  onToggleMode: (mode: "wander" | "work") => void;
  className?: string;
}

/**
 * Highly visible, persistent two-state mode toggle:
 * WORK MODE | PLAY HOUSE
 *
 * Designed with authentic Windows 95 / 98 3D beveled aesthetics and
 * Idea Kutir's signature blue palette.
 */
export default function ModeToggle({
  mode,
  onToggleMode,
  className = "",
}: ModeToggleProps) {
  const isWork = mode === "work";
  const isPlay = mode === "wander";

  return (
    <div
      role="group"
      aria-label="Experience Mode Selector"
      className={`inline-flex items-center bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] p-0.5 shadow-sm select-none font-sans ${className}`}
    >
      {/* WORK MODE button */}
      <button
        type="button"
        onClick={() => onToggleMode("work")}
        aria-pressed={isWork}
        className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition-none cursor-pointer flex items-center gap-1 min-h-[30px] sm:min-h-[26px] ${
          isWork
            ? "bg-[#13265C] text-white border-2 border-t-black border-l-black border-b-white border-r-white shadow-inner"
            : "bg-[#c0c0c0] text-black hover:bg-[#d8d8d8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
        }`}
        title="Switch to Professional Work Mode (Recruiter View)"
      >
        <span className="text-[12px]">💼</span>
        <span>WORK MODE</span>
      </button>

      {/* Vertical separator */}
      <div className="w-[1px] h-4 bg-[#808080] mx-0.5 border-r border-white" />

      {/* PLAY HOUSE button */}
      <button
        type="button"
        onClick={() => onToggleMode("wander")}
        aria-pressed={isPlay}
        className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-bold transition-none cursor-pointer flex items-center gap-1 min-h-[30px] sm:min-h-[26px] ${
          isPlay
            ? "bg-[#13265C] text-white border-2 border-t-black border-l-black border-b-white border-r-white shadow-inner"
            : "bg-[#c0c0c0] text-black hover:bg-[#d8d8d8] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
        }`}
        title="Switch to Interactive 3D Play House"
      >
        <span className="text-[12px]">🏠</span>
        <span>PLAY HOUSE</span>
      </button>
    </div>
  );
}
