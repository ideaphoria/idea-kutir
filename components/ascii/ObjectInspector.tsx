"use client";

import React, { useEffect } from "react";
import { InteractiveObject3D, getProjectData } from "@/data/house3d";
import { WIN95 } from "./retroWin95";

interface ObjectInspectorProps {
  object: InteractiveObject3D;
  onClose: () => void;
  isCollected?: boolean;
  onCollect?: (objId: string) => void;
}

export default function ObjectInspector({
  object,
  onClose,
  isCollected = false,
  onCollect,
}: ObjectInspectorProps) {
  const project = getProjectData(object.connectedProjectId);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "e" || e.key === "E") {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 pointer-events-auto select-none font-sans"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-black flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <header className="h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#000080] to-[#1084d0] text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span>📄</span>
            <span>Object Properties — {object.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-4 h-4 shrink-0 flex items-center justify-center text-black font-bold text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close [ESC]"
          >
            ✕
          </button>
        </header>

        {/* Sub-header info bar */}
        <div className="px-3 py-1.5 border-b border-[#808080]/30 bg-[#c0c0c0] flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] uppercase tracking-wide text-[#333]">
              Specimen Type:
            </span>
            <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px] font-mono">
              {object.type.toUpperCase()}
            </span>
          </div>
          <span className="text-[11px] text-[#555] font-mono">
            Room: {object.roomId.toUpperCase()}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#c0c0c0] space-y-3 font-sans">
          {/* Object Description Panel */}
          <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
            <div className="text-xs font-bold text-[#000080] mb-1.5 flex items-center gap-1">
              <span>📌</span> Description &amp; Architectural Context
            </div>
            <p className="text-xs text-black leading-relaxed font-sans select-text">
              {object.description}
            </p>
          </div>

          {/* Connected Real Portfolio Project */}
          {project && (
            <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 mb-2 border-b border-[#808080]/30 pb-2">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#666] tracking-wider">
                    Connected Portfolio Project &middot; {project.category}
                  </div>
                  <h3 className="text-base font-bold text-black mt-0.5">
                    {project.title}
                  </h3>
                </div>
                {project.subtitle && (
                  <span className="text-xs text-[#555] italic">
                    {project.subtitle}
                  </span>
                )}
              </div>

              <p className="text-xs text-black leading-relaxed mb-3 select-text">
                {project.summary}
              </p>

              {/* Disciplines */}
              {project.disciplines && project.disciplines.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] font-bold uppercase text-[#555] mb-1">
                    Disciplines:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {project.disciplines.map((d) => (
                      <span
                        key={d}
                        className="text-[11px] bg-[#e0e0e0] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] px-1.5 py-0.5 text-black font-sans"
                      >
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Inquiries / Process */}
              {project.processPoints && project.processPoints.length > 0 && (
                <div className="border-t border-[#808080]/30 pt-2.5">
                  <div className="text-[10px] font-bold uppercase text-[#555] mb-1.5">
                    Methodological Focus:
                  </div>
                  <ul className="space-y-1.5 text-xs text-black">
                    {project.processPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-[#000080] font-bold">&bull;</span>
                        <span>
                          <strong>{pt.title}:</strong> {pt.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Action & Status Bar */}
        <div className="p-2.5 border-t border-[#808080]/40 bg-[#c0c0c0] flex items-center justify-between gap-2">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-1 text-[11px] text-[#444] font-mono truncate">
            LOCATION: {object.roomId.toUpperCase()} &middot; ID: {object.id}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onCollect && (
              <button
                type="button"
                onClick={() => onCollect(object.id)}
                className={isCollected ? WIN95.classes.btnActive : WIN95.classes.btn}
              >
                {isCollected ? "✓ In Satchel" : "💼 Collect Artifact [I]"}
              </button>
            )}
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
    </div>
  );
}
