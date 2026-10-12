"use client";

import React, { useState } from "react";
import { HOUSE_ROOMS_3D, InteractiveObject3D } from "@/data/house3d";
import { ControlTelemetry } from "./FirstPersonControls";

interface AsciiHUDProps {
  telemetry: ControlTelemetry;
  hoveredObject: InteractiveObject3D | null;
  mode: "wander" | "work";
  onToggleMode: (newMode: "wander" | "work") => void;
  onSelectRoom: (roomId: string) => void;
  onRequestPointerLock: () => void;
  isInspecting: boolean;
  onInteract?: () => void;
  onOpenInventory?: () => void;
  onOpenNavigation?: () => void;
  collectedCount?: number;
  toastMessage?: string | null;
}

export default function AsciiHUD({
  telemetry,
  hoveredObject,
  mode,
  onToggleMode,
  onSelectRoom,
  onRequestPointerLock,
  isInspecting,
  onInteract,
  onOpenInventory,
  onOpenNavigation,
  collectedCount = 0,
  toastMessage = null,
}: AsciiHUDProps) {
  const currentRoom = HOUSE_ROOMS_3D[telemetry.currentRoomId] || HOUSE_ROOMS_3D.exterior;
  const [isLegendMinimized, setIsLegendMinimized] = useState(false);

  const floorLabel = currentRoom.level === "exterior" ? "Outside" : "Ground Floor";

  return (
    <div className="absolute inset-0 pointer-events-none select-none font-mono text-xs flex flex-col justify-between p-4 sm:p-6 text-[#d8d3c7]">
      {/* ─────────────────────────────────────────────────────────────
          TOP BAR: RETRO WINDOWS 95 TOOLBAR & CONTROLS
          ───────────────────────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-auto font-sans">
        {/* Navigation & Location Toolbar */}
        <div className="flex items-center bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-1 shadow-md gap-1.5 text-black">
          <div className="px-2 py-0.5 bg-gradient-to-r from-[#000080] to-[#1084d0] text-white text-[11px] font-bold flex items-center gap-1 select-none">
            <span>🏛</span>
            <span>Idea Kutir</span>
          </div>
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-xs text-black flex items-center gap-1.5 select-text">
            <span className="font-bold">{floorLabel}</span>
            <span className="text-[#808080]">|</span>
            <span className="font-semibold text-[#000080]">{currentRoom.name}</span>
            <span className="hidden md:inline text-[10px] text-[#555] border-l border-[#ccc] pl-1.5 font-mono">
              {currentRoom.subtitle || currentRoom.discipline}
            </span>
          </div>
        </div>

        {/* Action Shortcuts & Mode Switcher */}
        <div className="flex items-center gap-1.5">
          {/* Inventory Quick Button */}
          {onOpenInventory && (
            <button
              type="button"
              onClick={onOpenInventory}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black font-sans font-bold text-xs shadow-sm hover:bg-[#d4d4d4] cursor-pointer"
              title="Open Collected Artifacts Archive [I]"
            >
              <span>💼</span>
              <span>Satchel</span>
              <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-1.5 text-[10px] font-mono font-bold text-black">
                {collectedCount}
              </span>
            </button>
          )}

          {/* Directory Quick Button */}
          {onOpenNavigation && (
            <button
              type="button"
              onClick={onOpenNavigation}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black font-sans font-bold text-xs shadow-sm hover:bg-[#d4d4d4] cursor-pointer"
              title="Open House Architectural Directory [TAB]"
            >
              <span>🗺️</span>
              <span>Directory</span>
              <span className="text-[10px] text-[#555] font-mono">[TAB]</span>
            </button>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-0.5 shadow-sm gap-0.5">
            <span className="px-2.5 py-0.5 bg-[#dcdcdc] border-2 border-t-black border-l-black border-b-white border-r-white text-black font-sans font-bold text-[11px] select-none shadow-inner">
              Wander
            </span>
            <a
              href="/work"
              className="px-2.5 py-0.5 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black font-sans font-bold text-[11px] hover:bg-[#d4d4d4] flex items-center gap-1 select-none"
              title="Switch to Professional Portfolio (Work Mode)"
            >
              <span>Work</span>
              <span className="text-[#000080] font-bold">&rarr;</span>
            </a>
          </div>
        </div>
      </header>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 pointer-events-none z-50 animate-fade-in">
          <div className="bg-[#0e1222]/95 border border-[#0047BB] text-[#00e5ff] px-4 py-2 text-xs rounded shadow-2xl backdrop-blur-md">
            {toastMessage}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CENTER RETICLE & OBJECT PROXIMITY PROMPT
          ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none font-sans">
        {/* Reticle */}
        {!isInspecting && (
          <div
            className={`transition-all duration-150 ${
              hoveredObject
                ? "text-white font-mono font-bold text-base bg-black/60 px-1 border border-white"
                : "text-white/60 font-mono text-base"
            }`}
          >
            {hoveredObject ? "[ + ]" : "+"}
          </div>
        )}

        {/* Proximity Prompt (Retro Windows 95 tooltip / alert) */}
        {hoveredObject && !isInspecting && (
          <div className="mt-4 pointer-events-auto">
            <div
              onClick={() => onInteract?.()}
              role="button"
              tabIndex={0}
              className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] p-2 text-center cursor-pointer font-sans min-w-[220px]"
            >
              <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white text-[11px] font-bold px-2 py-0.5 mb-1.5 flex justify-between items-center select-none">
                <span>INTERACT</span>
                <span className="font-mono text-yellow-300 font-bold">[ E ]</span>
              </div>
              <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-2">
                <div className="text-xs font-bold text-black">{hoveredObject.name}</div>
                <div className="text-[11px] text-[#555] italic mt-0.5">
                  Click or press E to inspect
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Start Gameplay / Pointer Lock Banner (Retro Welcome Dialog)
            Appears ONLY when the player is genuinely outside the house in the exterior entry area */}
        {telemetry.currentRoomId === "exterior" &&
          telemetry.z >= 0.5 &&
          !telemetry.isLocked &&
          mode === "wander" &&
          !isInspecting &&
          !hoveredObject && (
          <div
            onClick={onRequestPointerLock}
            role="button"
            tabIndex={0}
            className="mt-6 pointer-events-auto cursor-pointer"
          >
            <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-4 shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-center max-w-sm font-sans">
              <div className="bg-gradient-to-r from-[#000080] to-[#1084d0] text-white text-xs font-bold px-2 py-1 mb-2.5 select-none">
                IDEA KUTIR — 3D ARCHITECTURAL ARCHIVE
              </div>
              <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 mb-3">
                <p className="text-xs text-black leading-relaxed">
                  Click anywhere or press WASD to start exploring the house.
                </p>
              </div>
              <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white py-1 px-4 text-xs font-bold text-black shadow-sm inline-block cursor-pointer select-none">
                [ ENTER HOUSE ]
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM BAR: CONTROLS LEGEND & TELEMETRY
          ───────────────────────────────────────────────────────────── */}
      <footer className="w-full flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3 pointer-events-auto font-sans">
        {/* Controls Legend (Retro Utility Window) */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-1 shadow-[2px_2px_0px_rgba(0,0,0,0.7)] w-64 pointer-events-auto text-[11px] text-black">
          <div className="h-5 px-1 bg-gradient-to-r from-[#000080] to-[#1084d0] text-white font-bold flex items-center justify-between select-none">
            <span className="text-[10px] tracking-wide">CONTROLS.INI</span>
            <button
              type="button"
              onClick={() => setIsLegendMinimized(!isLegendMinimized)}
              className="w-3.5 h-3.5 bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black text-black font-bold text-[8px] flex items-center justify-center leading-none cursor-pointer"
              title={isLegendMinimized ? "Restore" : "Minimize"}
            >
              {isLegendMinimized ? "▲" : "▼"}
            </button>
          </div>
          {!isLegendMinimized && (
            <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-2 mt-1 space-y-1">
              <div className="flex justify-between">
                <span className="font-bold">W A S D</span>
                <span className="text-[#555]">Move</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">MOUSE</span>
                <span className="text-[#555]">Look around</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">E</span>
                <span className="text-[#555]">Inspect / Interact</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">I</span>
                <span className="text-[#555]">Satchel</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">TAB</span>
                <span className="text-[#555]">Directory</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">M</span>
                <span className="text-[#555]">Blueprint Map</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">1 – 3</span>
                <span className="text-[#555]">Quick Travel</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">ESC</span>
                <span className="text-[#555]">Free Mouse</span>
              </div>
            </div>
          )}
        </div>

        {/* Spatial Telemetry Status Pane on bottom-right */}
        <div className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black p-1 shadow-md flex items-center gap-1 text-[11px] text-black">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 bg-white font-mono">
            POS: X {telemetry.x.toFixed(1)} &middot; Z {telemetry.z.toFixed(1)}
          </div>
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 bg-white font-mono">
            HDG: {telemetry.yawDegrees}&deg;
          </div>
        </div>
      </footer>
    </div>
  );
}
