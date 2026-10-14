"use client";

import React, { useState, useEffect } from "react";
import { PROJECTS, Project } from "@/data/house";
import { WIN95 } from "./retroWin95";

export interface BehanceProject {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  year: string;
  thumbnail: string;
  url: string;
}

export const BEHANCE_PROJECTS: BehanceProject[] = [
  {
    id: "astrotak",
    title: "Re-designing Astrotak",
    subtitle: "Astrology & Kundli Platform · Product & UX/UI Redesign",
    category: "UI/UX · Product",
    year: "2024",
    thumbnail: "/artworks/behance/astrotak.png",
    url: "https://www.behance.net/gallery/214842555/Re-designing-Astrotak",
  },
  {
    id: "nagad",
    title: "Nagad App",
    subtitle: "Mobile Financial Services & Digital Banking UI/UX",
    category: "FinTech · Design System",
    year: "2023",
    thumbnail: "/artworks/behance/nagad.png",
    url: "https://www.behance.net/gallery/177860919/Nagad-App",
  },
  {
    id: "ewallet",
    title: "E-wallet App Iconography",
    subtitle: "Fintech Visual System & Micro-Iconography Suite",
    category: "Iconography · Design System",
    year: "2023",
    thumbnail: "/artworks/behance/ewallet-iconography.png",
    url: "https://www.behance.net/gallery/169784915/E-wallet-App-Iconography",
  },
  {
    id: "triplo",
    title: "Triplo UX Case study",
    subtitle: "Travel Planning, Group Itineraries & Discovery App",
    category: "UX Research · Case Study",
    year: "2023",
    thumbnail: "/artworks/behance/triplo.png",
    url: "https://www.behance.net/gallery/169008375/Triplo-UX-Case-study",
  },
];

interface ProjectDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectId?: string;
}

export default function ProjectDirectoryModal({
  isOpen,
  onClose,
  initialProjectId,
}: ProjectDirectoryModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    initialProjectId || null
  );

  const projectList: Project[] = Object.values(PROJECTS);
  const activeProject = selectedProjectId ? PROJECTS[selectedProjectId] : null;

  useEffect(() => {
    if (!isOpen) {
      setSelectedProjectId(initialProjectId || null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, initialProjectId]);

  if (!isOpen) return null;

  const handleOpenBehance = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/60 pointer-events-auto select-none font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black shadow-[2px_2px_0px_rgba(0,0,0,0.7)] text-black flex flex-col max-h-[94vh] overflow-hidden"
      >
        {/* Title Bar */}
        <header className="h-7 sm:h-6 px-1.5 flex items-center justify-between select-none bg-gradient-to-r from-[#000080] to-[#1084d0] text-white">
          <div className="flex items-center gap-1.5 text-xs font-bold truncate">
            <span>💻</span>
            <span>IDEA KUTIR — STUDY COMPUTER · BEHANCE PROJECTS</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 sm:w-4 sm:h-4 shrink-0 flex items-center justify-center text-black font-bold text-xs sm:text-[10px] leading-none cursor-pointer bg-[#c0c0c0] border border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white"
            title="Close Terminal [ESC]"
          >
            ✕
          </button>
        </header>

        {/* Menu / Address Bar */}
        <div className="px-2.5 py-1.5 border-b border-[#808080]/30 bg-[#c0c0c0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[11px] uppercase tracking-wide text-[#333]">
              Location:
            </span>
            <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px] font-mono text-black">
              {activeProject
                ? `C:\\PORTFOLIO\\PROJECTS\\${activeProject.id.toUpperCase()}`
                : "C:\\PORTFOLIO\\BEHANCE\\*.*"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {activeProject && (
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white px-2 py-0.5 text-[11px] font-bold text-black hover:bg-[#d4d4d4] cursor-pointer flex items-center gap-1"
              >
                <span>&larr;</span>
                <span>Back to Grid</span>
              </button>
            )}
            <span className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white px-2 py-0.5 text-[11px] font-mono text-[#555]">
              {BEHANCE_PROJECTS.length} BEHANCE PROJECTS
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 bg-[#c0c0c0] space-y-3 font-sans">
          {!activeProject ? (
            /* Behance 2x2 Visual Grid View */
            <div className="space-y-3">
              {/* Introduction Panel */}
              <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
                <div className="text-xs font-bold text-[#000080] mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span>📁</span>
                    <span>BEHANCE PORTFOLIO ARCHIVES · ASHANI NATH (@AshaniNath)</span>
                  </div>
                  <a
                    href="https://www.behance.net/AshaniNath"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#000080] hover:underline font-bold flex items-center gap-1"
                  >
                    behance.net/AshaniNath ↗
                  </a>
                </div>
                <p className="text-xs text-black leading-relaxed">
                  Terminal workstation connected to the live product design and UX case studies. Click any project cover or title below to inspect the complete Behance dossier in a new tab.
                </p>
              </div>

              {/* 2x2 Grid of Project-Cover Thumbnails */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {BEHANCE_PROJECTS.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleOpenBehance(project.url)}
                    className="border-2 border-t-white border-l-white border-b-black border-r-black bg-[#fffffa] hover:bg-[#fff9e6] p-2.5 flex flex-col justify-between cursor-pointer group shadow-[1px_1px_0px_rgba(0,0,0,0.5)] active:border-t-black active:border-l-black active:border-b-white active:border-r-white transition-colors"
                  >
                    <div>
                      {/* Thumbnail Container with Inset Win95 Bevel (Exact 960x614 aspect ratio) */}
                      <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white overflow-hidden bg-[#111] aspect-[960/614] flex items-center justify-center relative">
                        {/* Normal, Non-ASCII Image */}
                        <img
                          src={project.thumbnail}
                          alt={project.title}
                          className="w-full h-full object-contain group-hover:scale-[1.01] transition-transform duration-150"
                        />
                        <div className="absolute top-2 right-2 bg-black/80 text-white px-1.5 py-0.5 text-[9px] font-mono tracking-wider uppercase border border-white/20">
                          {project.year}
                        </div>
                      </div>

                      {/* Title & Subtitle Beneath Thumbnail */}
                      <div className="mt-2.5">
                        <div className="flex items-baseline justify-between gap-1 mb-0.5">
                          <h3 className="text-sm font-bold text-black group-hover:text-[#000080] leading-snug">
                            {project.title}
                          </h3>
                        </div>
                        <p className="text-[11px] text-[#444] leading-relaxed mb-2">
                          {project.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div className="flex items-center justify-between border-t border-[#808080]/30 pt-2 mt-1">
                      <span className="border border-[#808080]/40 bg-[#efefef] px-1.5 py-0.5 text-[10px] font-mono text-black">
                        {project.category}
                      </span>
                      <span className="text-xs font-bold text-[#000080] group-hover:underline flex items-center gap-0.5">
                        <span>Open on Behance</span>
                        <span>↗</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Full Project Detail Dossier View */
            <div className="space-y-3">
              {/* Header Card */}
              <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2 border-b border-[#808080]/30 pb-2">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-[#666] tracking-wider mb-0.5">
                      {activeProject.category} &middot; Room: {activeProject.roomName}
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-black">
                      {activeProject.title}
                    </h2>
                    <div className="text-xs text-[#555] italic mt-0.5">
                      {activeProject.subtitle}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedProjectId(null)}
                    className="self-start bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white px-2.5 py-1 text-xs font-bold text-black hover:bg-[#d4d4d4] cursor-pointer"
                  >
                    &larr; Back to Directory
                  </button>
                </div>

                {/* Role & Context Meta */}
                {(activeProject.role || activeProject.context) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3 bg-[#f7f7f7] border border-[#808080]/30 p-2.5 text-xs">
                    {activeProject.role && (
                      <div>
                        <span className="font-bold text-[#333] block text-[10px] uppercase">
                          Role / Responsibility:
                        </span>
                        <span className="text-black">{activeProject.role}</span>
                      </div>
                    )}
                    {activeProject.context && (
                      <div>
                        <span className="font-bold text-[#333] block text-[10px] uppercase">
                          Context / Environment:
                        </span>
                        <span className="text-black">{activeProject.context}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Disciplines Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {activeProject.disciplines.map((d) => (
                    <span
                      key={d}
                      className="border border-[#808080]/50 bg-[#e8e8e8] px-2 py-0.5 text-[11px] font-mono text-black font-semibold"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              {/* Overview Panel */}
              <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
                <div className="text-xs font-bold text-[#000080] mb-1.5 flex items-center gap-1.5">
                  <span>📖</span>
                  <span>SYSTEM OVERVIEW</span>
                </div>
                <p className="text-xs text-black leading-relaxed font-sans select-text">
                  {activeProject.overview}
                </p>
              </div>

              {/* Process Points */}
              {activeProject.processPoints && activeProject.processPoints.length > 0 && (
                <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
                  <div className="text-xs font-bold text-[#000080] mb-2.5 flex items-center gap-1.5">
                    <span>⚙️</span>
                    <span>ARCHITECTURE &amp; PROCESS MILESTONES</span>
                  </div>
                  <div className="space-y-2.5">
                    {activeProject.processPoints.map((point, idx) => (
                      <div
                        key={idx}
                        className="border border-[#808080]/30 bg-[#fafafa] p-2.5"
                      >
                        <div className="text-xs font-bold text-black mb-1 flex items-center gap-1.5">
                          <span className="font-mono text-[#000080] text-[11px]">
                            0{idx + 1}.
                          </span>
                          <span>{point.title}</span>
                        </div>
                        <p className="text-xs text-[#333] leading-relaxed">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcomes & Artifacts */}
              {activeProject.outcomesPlaceholder && (
                <div className="border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-white p-3 sm:p-4">
                  <div className="text-xs font-bold text-[#000080] mb-1.5 flex items-center gap-1.5">
                    <span>📦</span>
                    <span>OUTCOMES &amp; DELIVERABLES</span>
                  </div>
                  <p className="text-xs text-black leading-relaxed font-sans select-text">
                    {activeProject.outcomesPlaceholder}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <footer className="px-2 py-1 bg-[#c0c0c0] border-t border-[#808080]/40 flex items-center justify-between gap-2 text-xs">
          <div className="border border-t-[#808080] border-l-[#808080] border-b-white border-r-white bg-[#c0c0c0] px-2 py-0.5 text-[11px] text-black font-mono truncate flex-1">
            {activeProject
              ? `READY · DISPLAYING ${activeProject.id.toUpperCase()}`
              : "READY · BROWSE PROJECTS"}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-black border-r-black active:border-t-black active:border-l-black active:border-b-white active:border-r-white px-3 py-0.5 text-xs font-bold text-black hover:bg-[#d4d4d4] cursor-pointer"
          >
            Close [ESC]
          </button>
        </footer>
      </div>
    </div>
  );
}
