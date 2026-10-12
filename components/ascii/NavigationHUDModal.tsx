"use client";

import React, { useEffect } from "react";
import { HOUSE_ROOMS_3D, Room3D } from "@/data/house3d";

interface NavigationHUDModalProps {
  isOpen: boolean;
  currentRoomId: string;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
  onOpenMap: () => void;
}

export const ROOM_SHORTCUTS: { key: string; roomId: string; label: string }[] = [
  { key: "1", roomId: "exterior", label: "00 · The Grounds (Facade & Arrival)" },
  { key: "2", roomId: "entrance_hall", label: "01 · Entrance Hall (Axial Gallery)" },
  { key: "3", roomId: "living_room", label: "02 · The Living Room (Primary Chamber)" },
];

export default function NavigationHUDModal({
  isOpen,
  currentRoomId,
  onClose,
  onSelectRoom,
  onOpenMap,
}: NavigationHUDModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Tab") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentRoom = HOUSE_ROOMS_3D[currentRoomId] || HOUSE_ROOMS_3D.exterior;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 pointer-events-auto select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-black flex flex-col max-h-[88vh]"
      >
        {/* Title Bar */}
        <header className="h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#000080] to-[#1084d0] text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span>🗺️</span>
            <span>Idea Kutir — Architectural Directory [TAB]</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 shrink-0 flex items-center justify-center text-black font-bold text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close [ESC / TAB]"
          >
            ✕
          </button>
        </header>

        {/* Current Location bar */}
        <div className="p-2 border-b border-[#808080]/30 bg-[#c0c0c0] flex flex-wrap items-center justify-between gap-2 text-xs text-black">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-1">
            LOCATION: <strong>{currentRoom.name}</strong>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenMap();
            }}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black px-2.5 py-1 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>📐</span>
            <span>View Floor Plan [M]</span>
          </button>
        </div>

        {/* Rooms list */}
        <div className="p-3 sm:p-4 space-y-2 overflow-y-auto flex-1 bg-[#c0c0c0]">
          {ROOM_SHORTCUTS.map((item) => {
            const room: Room3D = HOUSE_ROOMS_3D[item.roomId];
            const isCurrent = item.roomId === currentRoomId;

            return (
              <div
                key={item.roomId}
                className={`p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-2 ${
                  isCurrent
                    ? "bg-[#dcdcdc] border-t-black border-l-black border-b-white border-r-white shadow-inner"
                    : "bg-white border-t-[#808080] border-l-[#808080] border-b-white border-r-white"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 shrink-0 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black text-black font-mono font-bold text-xs flex items-center justify-center">
                    {item.key}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-black flex items-center gap-1.5">
                      <span>{room.name}</span>
                      <span className="text-[10px] text-[#555] font-normal uppercase">
                        &middot; {room.level}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#444] mt-0.5 leading-relaxed">
                      {room.subtitle || room.description}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {isCurrent ? (
                    <span className="px-2.5 py-1 bg-white border border-[#808080] text-[#000080] text-[11px] font-bold tracking-wide">
                      CURRENT ROOM
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectRoom(item.roomId);
                      }}
                      className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white text-black text-xs font-bold tracking-wide shadow-sm cursor-pointer hover:bg-[#d4d4d4]"
                    >
                      Travel [ {item.key} ]
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <footer className="p-2 bg-[#c0c0c0] border-t border-[#808080]/30 text-xs text-black flex items-center justify-between">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px]">
            Press keys <strong>1 – 3</strong> for instant quick-travel.
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 text-xs font-bold text-black bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white min-w-[70px] cursor-pointer"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
