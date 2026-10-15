"use client";

import React, { useEffect } from "react";
import { WIN95 } from "./retroWin95";

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
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
            <span>👤</span>
            <span>Resident Profile — Ashani (Idea Kutir)</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center text-black font-bold text-xs sm:text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close [ESC]"
          >
            ✕
          </button>
        </header>

        {/* Sub-header status bar */}
        <div className="px-3 py-1.5 border-b border-[#808080]/30 bg-[#c0c0c0] flex items-center justify-between text-xs text-black">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] uppercase tracking-wide text-[#333]">
              Role:
            </span>
            <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px]">
              Designer &middot; Researcher &middot; Spatial Practitioner
            </span>
          </div>
          <span className="text-[11px] text-[#555] font-mono">
            ARCHIVAL RECORD &middot; SEC-01
          </span>
        </div>

        {/* Content Body: Portrait + Dossier */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#c0c0c0] flex flex-col sm:flex-row gap-4 font-sans">
          {/* Left Column: Framed Archival Portrait */}
          <div className="shrink-0 w-full sm:w-48 border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-2 flex flex-col items-center">
            <div className="w-full text-[10px] font-bold text-[#13265C] uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>[ FIG. 01 ]</span>
              <span>RESIDENT SPECIMEN</span>
            </div>

            <div className="w-full aspect-[4/5] bg-black border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white overflow-hidden relative shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cat.jpg"
                alt="Cat Archival Portrait"
                className="w-full h-full object-cover select-none"
              />
            </div>

            <div className="w-full mt-2 text-[10px] font-mono text-[#444] flex flex-col gap-0.5 border-t border-[#808080]/30 pt-1.5">
              <div className="flex justify-between">
                <span className="text-[#666]">MEDIUM:</span>
                <span className="font-bold">ASCII High-Contrast</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">MOUNT:</span>
                <span>West Wall (Z: -8.0)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">FRAME:</span>
                <span>Beveled Timber</span>
              </div>
            </div>
          </div>

          {/* Right Column: Resident Dossier Details */}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            {/* Brief Introduction */}
            <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3">
              <div className="text-[11px] font-bold text-[#13265C] mb-1 flex items-center gap-1">
                <span>📋</span> Brief Introduction
              </div>
              <p className="text-xs text-black leading-relaxed select-text">
                UX Designer with 7+ years of multidisciplinary design experience, including 4+ years designing digital products across fintech, telecom, ecommerce, media, and enterprise environments. Experienced in user research, information architecture, user flows, wireframing, prototyping, usability testing, accessibility, and scalable design systems.
              </p>
            </div>

            {/* Overview of Design Practice */}
            <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3">
              <div className="text-[11px] font-bold text-[#13265C] mb-1 flex items-center gap-1">
                <span>🔍</span> Practice Overview
              </div>
              <p className="text-xs text-black leading-relaxed select-text">
                I specialize in UX design, user research, and product strategy, creating seamless experiences across fintech, telecom, e‑commerce, and media platforms. My work blends systems thinking with visual storytelling to craft intuitive, data‑driven solutions.
              </p>
            </div>

            {/* Areas of Practice */}
            <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3">
              <div className="text-[11px] font-bold text-[#13265C] mb-1.5 flex items-center gap-1">
                <span>🛠️</span> Areas of Practice
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                {[
                  "UX Design – User Research, Usability Testing, IA",
                  "Qualitative Research & Ethnography",
                  "Visual Narrative & Publication Arts",
                  "Speculative Media & Bioacoustics",
                ].map((area, idx) => (
                  <div
                    key={idx}
                    className="bg-[#f0f0f0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-1.5 text-black flex items-center gap-1.5"
                  >
                    <span className="text-[#224294] font-bold">&bull;</span>
                    <span className="text-[11px]">{area}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Short Practice Statement */}
            <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3">
              <div className="text-[11px] font-bold text-[#13265C] mb-1 flex items-center gap-1">
                <span>💬</span> Practice Statement
              </div>
              <blockquote className="border-l-2 border-[#769EFD] pl-2.5 text-xs italic text-[#333] leading-relaxed">
                &ldquo;[ Placeholder Practice Statement: A concise philosophical statement on space, materials, interface friction, and digital crafts. ]&rdquo;
              </blockquote>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-2.5 border-t border-[#808080]/40 bg-[#c0c0c0] flex items-center justify-between gap-2">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-1 text-[11px] text-[#444] font-mono truncate">
            LOCATION: West Gallery Wall (Z: -8.0) &middot; IDEA KUTIR
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
