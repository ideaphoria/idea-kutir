"use client";

import React from "react";
import { HOUSE_ROOMS_3D, getProjectData } from "@/data/house3d";

interface WorkModeDossierProps {
  currentRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onExamineProject?: (projectId: string) => void;
}

export default function WorkModeDossier({
  currentRoomId,
  onSelectRoom,
}: WorkModeDossierProps) {
  const room = HOUSE_ROOMS_3D[currentRoomId] || HOUSE_ROOMS_3D.living_room;
  const project = getProjectData(room.primaryProjectId);

  if (currentRoomId === "exterior" || currentRoomId === "entrance_hall") {
    return (
      <aside aria-label="Room Directory" className="pointer-events-auto bg-[#0a0a09]/95 border border-[#2b2925] p-5 max-w-sm w-full font-mono text-xs text-[#ded9cc] backdrop-blur-md shadow-2xl">
        <div className="text-[10px] uppercase tracking-widest text-[#3b82f6] mb-1">
          [ ARCHITECTURAL DIRECTORY &middot; RECRUITER VIEW ]
        </div>
        <h3 className="text-base font-serif font-medium text-[#f5f2ea] mb-2">
          {room.name}
        </h3>
        <p className="text-xs text-[#9c978b] leading-relaxed mb-4">
          Select any sector below to navigate directly or walk freely in the 3D space:
        </p>

        <div className="space-y-2">
          {[
            { id: "exterior", name: "00 The Grounds", focus: "Facade, Steps & Approach" },
            { id: "entrance_hall", name: "01 Entrance Hall", focus: "Gallery, Profile Portrait & Map" },
            { id: "living_room", name: "02 The Living Room", focus: "Product & Systems Projects" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectRoom(item.id)}
              className="w-full text-left p-2.5 border border-[#262420] hover:border-[#3b82f6] hover:bg-[#121b28] transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-medium text-[#eae6dc] group-hover:text-[#60a5fa]">
                  {item.name}
                </div>
                <div className="text-[10px] text-[#787468]">
                  {item.focus}
                </div>
              </div>
              <span className="text-[10px] text-[#555] group-hover:text-[#60a5fa]">&rarr;</span>
            </button>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside aria-label="Room Project Dossier" className="pointer-events-auto bg-[#0a0a09]/95 border border-[#2b2925] p-5 max-w-md w-full font-mono text-xs text-[#ded9cc] backdrop-blur-md shadow-2xl max-h-[75vh] overflow-y-auto">
      <div className="flex items-center justify-between border-b border-[#24221e] pb-2 mb-3">
        <span className="text-[10px] uppercase tracking-widest text-[#3b82f6]">
          ROOM {room.number} &middot; {room.level.toUpperCase()}
        </span>
        <span className="text-[10px] text-[#6b675c]">
          {room.subtitle}
        </span>
      </div>

      <h3 className="text-lg font-serif font-medium text-[#f5f2ea] mb-1">
        {room.name}
      </h3>
      <div className="text-[11px] text-[#8e897c] mb-3">
        {room.discipline}
      </div>

      <p className="text-xs text-[#aaa597] leading-relaxed mb-4 pb-3 border-b border-[#1f1e1a]">
        {room.description}
      </p>

      {project && (
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[#666258] mb-1.5">
            Primary Portfolio Project:
          </div>
          <div className="bg-[#141310] border border-[#282622] p-3.5 mb-3">
            <h4 className="text-sm font-serif font-medium text-[#f2eee3] mb-0.5">
              {project.title}
            </h4>
            <div className="text-[10px] text-[#7d796e] mb-2">
              {project.subtitle}
            </div>
            <p className="text-xs text-[#999487] leading-relaxed mb-3">
              {project.summary}
            </p>

            <div className="space-y-1.5 border-t border-[#22201c] pt-2">
              <div className="text-[10px] uppercase tracking-wider text-[#666258]">
                Key Dimensions:
              </div>
              {project.processPoints?.slice(0, 2).map((pt, i) => (
                <div key={i} className="text-[11px] text-[#888478]">
                  <span className="text-[#3b82f6] mr-1">&middot;</span>
                  <span className="text-[#bbb6a8]">{pt.title}:</span> {pt.description}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-[#24221e] text-[10px] text-[#6b675c]">
        <span>Spatial Position: X {room.spawnPoint.x} &middot; Z {room.spawnPoint.z}</span>
        <button
          type="button"
          onClick={() => onSelectRoom("entrance_hall")}
          className="text-[#3b82f6] hover:underline"
        >
          [Return to Hallway]
        </button>
      </div>
    </aside>
  );
}
