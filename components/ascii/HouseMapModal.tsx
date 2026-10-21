"use client";

import React, { useEffect } from "react";
import { WIN95 } from "./retroWin95";

interface HouseMapModalProps {
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onClose: () => void;
}

export default function HouseMapModal({
  currentRoomId,
  onSelectRoom,
  onClose,
}: HouseMapModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "e" || e.key === "E" || e.key === "m" || e.key === "M") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 pointer-events-auto select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-black flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <header className="h-7 sm:h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#13265C] via-[#436ECC] to-[#769EFD] text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span>📐</span>
            <span>Idea Kutir — Floor Blueprint [M]</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center text-black font-bold text-xs sm:text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close [ESC / M]"
          >
            ✕
          </button>
        </header>

        {/* Sub-header status bar */}
        <div className="px-3 py-1.5 border-b border-[#808080]/30 bg-[#c0c0c0] flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] uppercase tracking-wide text-[#333]">
              Schematic:
            </span>
            <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px]">
              Ground Level Footprint &middot; Idea Kutir
            </span>
          </div>
          <span className="text-[11px] text-[#555] font-mono">
            ACTIVE ROOM: {currentRoomId.toUpperCase()}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#c0c0c0] space-y-3 font-sans">
          {/* ASCII Blueprint Schematic Viewport */}
          <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#000] p-3 text-white">
            <div className="text-[10px] font-mono text-[#00ff66] uppercase mb-1 flex items-center justify-between border-b border-[#333] pb-1">
              <span>[ CAD_SCHEMATIC.RAW ]</span>
              <span>1:1 SCALE</span>
            </div>
            <pre className="font-mono text-[10px] sm:text-[11px] leading-tight text-[#38ef7d] overflow-x-auto select-none py-1">{`   ┌───────────────────────────┐         ┌───────────────────────────┐
   │ [02] THE LIVING ROOM      │         │ [04] THE ART ROOM / STUDIO│
   │  · Product & Systems      │         │  · 7 Blue Frames (#769EFD)│
   │  · West Windows & Console │         │  · Easel & Relocated Wndw │
   └─────────────┬─────────────┘         └─────────────┬─────────────┘
                 │ (Doorway Z: -18)                    │ (Doorway Z: -18)
   ┌─────────────┴─────────────────────────────────────┴─────────────┐
   │ [01] ENTRANCE HALL (AXIAL GALLERY CORRIDOR)                     │
   │  · Portrait (West Z: -8) · Blueprint Map (East Z: -12)          │
   └─────────────┬─────────────────────────────────────┬─────────────┘
                 │ (Doorway Z: -7.5)                   │
                 │                       ┌─────────────┴─────────────┐
                 │                       │ [03] THE STUDY / WORKSPACE│
                 │                       │  · Terminal & Projects    │
                 │                       │  · Executive Walnut Desk  │
                 │                       │  · Bookcase Casework      │
                 │                       └───────────────────────────┘
                 │ (Aperture Z: 0)
   ┌─────────────┴─────────────────────────────────────┴─────────────┐
   │ [00] THE GROUNDS APPROACH / EXTERIOR STONE WALKWAY              │
   │  · Steps & Facade · East Stone Garden Path                      │
   └─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>

          {/* Active Sectors Navigation */}
          <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3">
            <div className="text-[11px] font-bold text-[#13265C] mb-2 flex items-center gap-1">
              <span>🚪</span> Fast Navigation — Active Sectors:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {[
                { id: "exterior", num: "00", name: "The Grounds", note: "Facade & Walkway" },
                { id: "entrance_hall", num: "01", name: "Entrance Hall", note: "Gallery Corridor" },
                { id: "living_room", num: "02", name: "Living Room", note: "Primary Chamber" },
                { id: "study", num: "03", name: "The Study", note: "Office & Terminal" },
                { id: "art_room", num: "04", name: "The Art Room", note: "Studio & Gallery" },
              ].map((room) => {
                const isCurrent = currentRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      onSelectRoom(room.id);
                      onClose();
                    }}
                    className={`p-2 text-left cursor-pointer transition-none ${
                      isCurrent
                        ? WIN95.classes.btnActive
                        : WIN95.classes.btn
                    }`}
                  >
                    <div className="text-[10px] font-mono font-bold text-[#13265C]">
                      [{room.num}] {isCurrent ? "📍 CURRENT" : ""}
                    </div>
                    <div className="text-xs font-bold text-black mt-0.5">
                      {room.name}
                    </div>
                    <div className="text-[10px] text-[#555] mt-0.5">
                      {room.note}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dormant / Future Wings Notice */}
          <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3">
            <div className="text-[11px] font-bold text-[#666] mb-2 flex items-center gap-1">
              <span>🔒</span> Dormant Architectural Wings (Under Construction):
            </div>
            <div className="space-y-1 text-xs text-[#555]">
              <div className="flex items-center justify-between bg-[#f0f0f0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-1">
                <span>[--] Upper Floor Loft &middot; Studio Workstations</span>
                <span className="text-[10px] font-mono text-[#888]">[ RESTRICTED ]</span>
              </div>
              <div className="flex items-center justify-between bg-[#f0f0f0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-1">
                <span>[--] North-East Wing &middot; Fieldwork &amp; Research Room</span>
                <span className="text-[10px] font-mono text-[#888]">[ RESTRICTED ]</span>
              </div>
              <div className="flex items-center justify-between bg-[#f0f0f0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-1">
                <span>[--] East Archive &middot; The Library &amp; Cinema Stack</span>
                <span className="text-[10px] font-mono text-[#888]">[ RESTRICTED ]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[#808080]/40 bg-[#c0c0c0] flex items-center justify-between gap-2">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-1 text-[11px] text-[#444] font-mono truncate">
            LOCATION: East Gallery Wall (Z: -12.0) &middot; IDEA KUTIR
          </div>

          <button
            type="button"
            onClick={onClose}
            className={WIN95.classes.btn}
          >
            Close [ESC]
          </button>
        </div>
      </div>
    </div>
  );
}
