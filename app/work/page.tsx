"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { PROJECTS, Project } from "@/data/house";

export default function WorkPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "skills" | "about" | "contact">("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  const allProjects = useMemo(() => Object.values(PROJECTS), []);

  const filteredProjects = useMemo(() => {
    return allProjects.filter((p) => {
      const matchesSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.disciplines.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        activeCategory === "all" ||
        (activeCategory === "product" && p.id === "selected-ui-ux") ||
        (activeCategory === "research" && p.id === "learning-from-place") ||
        (activeCategory === "narrative" && p.id === "the-hands-that-forgot") ||
        (activeCategory === "speculative" && p.id === "cetacean-communication-station");

      return matchesSearch && matchesCategory;
    });
  }, [allProjects, searchQuery, activeCategory]);

  const selectedProject: Project | null = useMemo(() => {
    if (!selectedProjectId) return null;
    return PROJECTS[selectedProjectId] || null;
  }, [selectedProjectId]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("ashani.gorakhnath@gmail.com");
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#008080] text-[#111111] font-sans p-2 sm:p-4 md:p-6 flex flex-col justify-start selection:bg-[#000080] selection:text-white">
      {/* ─────────────────────────────────────────────────────────────
          MASTER WORKSPACE WINDOW (Classic Gray Chassis & Inset Panels)
          ───────────────────────────────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-2xl flex flex-col">
        {/* 1. Title Bar */}
        <header
          className="h-8 bg-[#000080] text-white px-2.5 flex items-center justify-between font-bold text-xs select-none shadow-inner"
          style={{ letterSpacing: "0.2px" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">📐</span>
            <h1 className="text-xs truncate tracking-wide">
              Ashani Gorakhnath — Professional Portfolio & Work Systems
            </h1>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <Link
              href="/"
              className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d4d0c8] text-[#111] font-bold text-[11px] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white rounded-none shadow-xs flex items-center gap-1"
              title="Return to 3D ASCII House"
            >
              <span>🏠</span>
              <span className="hidden sm:inline">Enter 3D House</span>
            </Link>
          </div>
        </header>

        {/* 2. Top Tabs Row (Matching Reference Image Tabs) */}
        <nav
          aria-label="Main Navigation Tabs"
          className="bg-[#c0c0c0] px-2 pt-1.5 border-b-2 border-[#808080] flex flex-wrap items-end gap-1 text-xs"
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab("projects");
              setActiveCategory("all");
            }}
            className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-colors cursor-pointer ${
              activeTab === "projects" && activeCategory === "all"
                ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10"
                : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
            }`}
          >
            📄 Selected Work ({allProjects.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("projects");
              setActiveCategory("product");
            }}
            className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-colors cursor-pointer ${
              activeTab === "projects" && activeCategory === "product"
                ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10"
                : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
            }`}
          >
            🎨 Product & Systems
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("projects");
              setActiveCategory("research");
            }}
            className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-colors cursor-pointer ${
              activeTab === "projects" && activeCategory === "research"
                ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10"
                : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
            }`}
          >
            🧭 Situated Research
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-colors cursor-pointer ${
              activeTab === "skills"
                ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10"
                : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
            }`}
          >
            🛠️ Capabilities & Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("about")}
            className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-colors cursor-pointer ${
              activeTab === "about"
                ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10"
                : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
            }`}
          >
            👤 About & Experience
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-colors cursor-pointer ${
              activeTab === "contact"
                ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10"
                : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
            }`}
          >
            ✉️ Contact
          </button>

          <div className="ml-auto flex items-center gap-2 pb-1">
            <Link
              href="/"
              className="px-2.5 py-0.5 bg-[#d8f0d8] hover:bg-[#c4ecc4] text-[#115511] font-bold text-xs border border-[#2b882b] flex items-center gap-1 rounded-xs"
            >
              <span>🧭</span>
              <span>Wander Mode (3D House) &rarr;</span>
            </Link>
          </div>
        </nav>

        {/* 3. Top Action / User Profile Bar */}
        <section
          aria-label="Profile and Search Bar"
          className="bg-[#c0c0c0] p-2 sm:p-2.5 border-b-2 border-[#808080] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
        >
          {/* User Profile Info Card (Matching Reference Image User Widget) */}
          <div className="flex items-center gap-2.5 bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-1.5 px-2.5 shadow-xs shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#000080] text-white flex items-center justify-center font-bold text-sm shadow-inner">
              AG
            </div>
            <div>
              <div className="font-bold text-xs leading-tight text-black flex items-center gap-1.5">
                <span>Ashani Gorakhnath</span>
                <span className="text-[10px] text-[#555] font-normal">@ashanigorakhnath</span>
              </div>
              <div className="text-[10px] text-[#444] leading-tight">
                Lead Product Designer & UX Systems Architect
              </div>
            </div>
          </div>

          {/* Search & Filter Input (Matching Reference Image Search Box) */}
          <div className="flex-1 max-w-lg flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search files, projects, skills, or tokens..."
                className="w-full bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-2.5 py-1 text-xs text-black placeholder:text-[#888] focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1 text-[#888] hover:text-black font-bold text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="px-2.5 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#ffffff] active:border-r-[#ffffff] font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>✉️</span>
              <span>{copiedEmail ? "Copied!" : "Copy Email"}</span>
            </button>
            <a
              href="#contact"
              onClick={() => setActiveTab("contact")}
              className="px-2.5 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#ffffff] active:border-r-[#ffffff] font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <span>💼</span>
              <span>Hire Me</span>
            </a>
          </div>
        </section>

        {/* 4. Split Layout: Left Navigation Sidebar + Main Workstation Content */}
        <div className="flex flex-col md:flex-row flex-1 min-h-[620px]">
          {/* Left Navigation Sidebar (Matching Reference Image Sidebar) */}
          <aside
            aria-label="Portfolio Sidebar"
            className="w-full md:w-60 lg:w-64 bg-[#c0c0c0] p-2.5 border-b-2 md:border-b-0 md:border-r-2 border-[#808080] flex flex-col gap-3 text-xs shrink-0"
          >
            {/* Navigation Quick Links */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("projects");
                  setActiveCategory("all");
                }}
                className={`w-full text-left px-2 py-1 flex items-center gap-2 rounded-none font-medium cursor-pointer ${
                  activeTab === "projects" && activeCategory === "all"
                    ? "bg-[#000080] text-white font-bold"
                    : "hover:bg-[#d0d0d0] text-black"
                }`}
              >
                <span>📌</span>
                <span>Recents / Selected Work</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("projects");
                  setActiveCategory("product");
                }}
                className={`w-full text-left px-2 py-1 flex items-center gap-2 rounded-none font-medium cursor-pointer ${
                  activeCategory === "product"
                    ? "bg-[#000080] text-white font-bold"
                    : "hover:bg-[#d0d0d0] text-black"
                }`}
              >
                <span>🎨</span>
                <span>Design Systems & UI</span>
              </button>
            </div>

            {/* Favorite Files / Case Studies (Matching Reference Image Inset White List Box) */}
            <div>
              <div className="font-bold text-[11px] text-[#333] mb-1 px-1 flex items-center justify-between">
                <span>Favorite Files</span>
                <span className="text-[10px] text-[#666]">4 case studies</span>
              </div>
              <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 space-y-0.5 max-h-48 overflow-y-auto">
                {allProjects.map((p) => {
                  const isSelected = selectedProjectId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProjectId(p.id)}
                      className={`w-full text-left px-2 py-1 flex items-center gap-1.5 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? "bg-[#000080] text-white font-bold"
                          : "hover:bg-[#eef3ff] text-black"
                      }`}
                    >
                      <span className="text-[11px] shrink-0">📄</span>
                      <span className="truncate">{p.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Capabilities / Teams Box */}
            <div>
              <div className="font-bold text-[11px] text-[#333] mb-1 px-1">
                Teams & Capabilities
              </div>
              <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-1.5 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-[#333]">
                  <span>🔹</span>
                  <span>Product Architecture</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#333]">
                  <span>🔹</span>
                  <span>Design Token Systems</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#333]">
                  <span>🔹</span>
                  <span>Qualitative Ethnography</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#333]">
                  <span>🔹</span>
                  <span>Interactive Prototyping</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#333]">
                  <span>🔹</span>
                  <span>Spatial & Sensory Media</span>
                </div>
              </div>
            </div>

            {/* Recruiter Availability Badge */}
            <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 space-y-1 mt-auto">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#006600]">
                <span>🟢</span>
                <span>Active Candidate Status</span>
              </div>
              <p className="text-[10px] text-[#444] leading-tight">
                Open to Senior / Lead Product Design, Design Systems, and UX Architecture roles.
              </p>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 bg-[#c0c0c0] p-3 sm:p-4 md:p-5 overflow-y-auto flex flex-col gap-4">
            {/* TAB 1: PROJECTS & CASE STUDIES */}
            {activeTab === "projects" && (
              <>
                {/* A. Recently Viewed / Core Practice Highlights (3 Top Cards matching Reference Image) */}
                <div>
                  <div className="font-bold text-xs text-black mb-1.5 flex items-center justify-between">
                    <span>Recently viewed</span>
                    <span className="text-[11px] text-[#555] font-normal">
                      3 Core Practice Disciplines
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Top Card 1 */}
                    <div
                      onClick={() => {
                        setSelectedProjectId("selected-ui-ux");
                      }}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 hover:bg-[#d0d0d0] cursor-pointer flex items-center gap-2.5 shadow-xs"
                    >
                      <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center text-lg shrink-0">
                        📐
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-black truncate">
                          New design file
                        </div>
                        <div className="text-[10px] text-[#555] truncate">
                          Design and prototype
                        </div>
                      </div>
                    </div>

                    {/* Top Card 2 */}
                    <div
                      onClick={() => {
                        setSelectedProjectId("learning-from-place");
                      }}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 hover:bg-[#d0d0d0] cursor-pointer flex items-center gap-2.5 shadow-xs"
                    >
                      <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center text-lg shrink-0">
                        🗺️
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-black truncate">
                          New FigJam file
                        </div>
                        <div className="text-[10px] text-[#555] truncate">
                          Whiteboard and diagram
                        </div>
                      </div>
                    </div>

                    {/* Top Card 3 */}
                    <Link
                      href="/"
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 hover:bg-[#d0d0d0] cursor-pointer flex items-center gap-2.5 shadow-xs"
                    >
                      <div className="w-8 h-8 bg-white border border-[#808080] flex items-center justify-center text-lg shrink-0">
                        🏠
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-black truncate">
                          Enter 3D House
                        </div>
                        <div className="text-[10px] text-[#555] truncate">
                          ASCII spatial wander mode
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* B. Main Grid: 6 Cards with Inset Previews (Matching Reference Image 3-Column Grid) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-sm text-black">
                      Case Studies & Production Files ({filteredProjects.length})
                    </h2>
                    <span className="text-[11px] text-[#555]">
                      Click any card to read full recruiter case study
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {/* Card 1: Selected UI/UX Work */}
                    <article
                      onClick={() => setSelectedProjectId("selected-ui-ux")}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 flex flex-col justify-between hover:bg-[#d4d0c8] transition-colors cursor-pointer shadow-xs group"
                    >
                      <div>
                        {/* Inset Thumbnail Window */}
                        <div className="aspect-[16/10] bg-[#eef4ff] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-3 flex flex-col justify-between mb-2 overflow-hidden relative">
                          <div className="flex justify-between items-center text-[9px] font-mono text-[#000080] font-bold">
                            <span>W100-2 DESIGN SYSTEM</span>
                            <span>TOKEN MATRIX</span>
                          </div>
                          {/* Visual Wireframe / Token Mockup */}
                          <div className="flex-1 flex flex-col justify-center items-center gap-1.5 my-1">
                            <div className="w-full flex gap-1">
                              <div className="h-2 w-1/3 bg-[#769EFD] rounded-xs" />
                              <div className="h-2 w-2/3 bg-[#000080]/30 rounded-xs" />
                            </div>
                            <div className="w-full grid grid-cols-4 gap-1">
                              <div className="h-9 bg-white border border-[#769EFD] rounded-xs flex items-center justify-center font-mono text-[8px] font-bold text-[#000080]">
                                btn-pri
                              </div>
                              <div className="h-9 bg-white border border-[#cbd5e1] rounded-xs flex items-center justify-center font-mono text-[8px] text-[#64748b]">
                                input
                              </div>
                              <div className="h-9 bg-white border border-[#cbd5e1] rounded-xs flex items-center justify-center font-mono text-[8px] text-[#64748b] col-span-2">
                                modal-pane
                              </div>
                            </div>
                          </div>
                          <div className="text-[9px] text-[#555] font-mono">
                            Multi-platform Design Tokens
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">🎨</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight">
                              Selected UI/UX Work
                            </h3>
                            <div className="text-[10px] text-[#555]">
                              Lead Product Designer & System Architect
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                        <span className="bg-white px-1.5 py-0.2 border border-[#808080] font-mono text-[#333]">
                          The Studio
                        </span>
                        <span className="text-[#000080] font-bold group-hover:underline">
                          Open File ➔
                        </span>
                      </div>
                    </article>

                    {/* Card 2: Learning From Place */}
                    <article
                      onClick={() => setSelectedProjectId("learning-from-place")}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 flex flex-col justify-between hover:bg-[#d4d0c8] transition-colors cursor-pointer shadow-xs group"
                    >
                      <div>
                        {/* Inset Thumbnail Window */}
                        <div className="aspect-[16/10] bg-[#f7f5ed] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-3 flex flex-col justify-between mb-2 overflow-hidden relative">
                          <div className="flex justify-between items-center text-[9px] font-mono text-[#443311] font-bold">
                            <span>ETHNOGRAPHIC MAP</span>
                            <span>FIELD DIARY</span>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <svg viewBox="0 0 100 40" className="w-28 h-10 stroke-[#8c7438] fill-none" strokeWidth="1.5">
                              <path d="M 5 35 Q 25 10 45 25 T 95 15" />
                              <path d="M 5 38 Q 35 25 65 35 T 95 30" opacity="0.6" strokeDasharray="2,2" />
                            </svg>
                          </div>
                          <div className="text-[9px] text-[#665533] font-mono">
                            Situated Geographic Blueprint
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">🧭</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight">
                              Learning From Place
                            </h3>
                            <div className="text-[10px] text-[#555]">
                              Design Researcher & Ethnographer
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                        <span className="bg-white px-1.5 py-0.2 border border-[#808080] font-mono text-[#333]">
                          The Workroom
                        </span>
                        <span className="text-[#000080] font-bold group-hover:underline">
                          Open File ➔
                        </span>
                      </div>
                    </article>

                    {/* Card 3: The Hands That Forgot */}
                    <article
                      onClick={() => setSelectedProjectId("the-hands-that-forgot")}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 flex flex-col justify-between hover:bg-[#d4d0c8] transition-colors cursor-pointer shadow-xs group"
                    >
                      <div>
                        {/* Inset Thumbnail Window */}
                        <div className="aspect-[16/10] bg-[#1a1715] text-[#f2eee3] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-3 flex flex-col justify-between mb-2 overflow-hidden relative">
                          <div className="flex justify-between items-center text-[9px] font-mono text-[#c4b5a0] font-bold">
                            <span>PRINT PUBLICATION</span>
                            <span>INK PLATES</span>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <svg viewBox="0 0 60 40" className="w-20 h-10 stroke-[#e2dacb] fill-none" strokeWidth="1.5">
                              <path d="M 15 35 C 15 20, 25 15, 30 10 C 35 15, 45 20, 45 35" />
                              <circle cx="30" cy="18" r="4" stroke="#e2dacb" />
                            </svg>
                          </div>
                          <div className="text-[9px] text-[#a89985] font-mono">
                            Tactile Paper & Manual Craft
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">📖</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight">
                              The Hands That Forgot
                            </h3>
                            <div className="text-[10px] text-[#555]">
                              Author, Illustrator & Bookmaker
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                        <span className="bg-white px-1.5 py-0.2 border border-[#808080] font-mono text-[#333]">
                          The Library
                        </span>
                        <span className="text-[#000080] font-bold group-hover:underline">
                          Open File ➔
                        </span>
                      </div>
                    </article>

                    {/* Card 4: Cetacean Communication Station */}
                    <article
                      onClick={() => setSelectedProjectId("cetacean-communication-station")}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 flex flex-col justify-between hover:bg-[#d4d0c8] transition-colors cursor-pointer shadow-xs group"
                    >
                      <div>
                        {/* Inset Thumbnail Window */}
                        <div className="aspect-[16/10] bg-[#0c1626] text-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-3 flex flex-col justify-between mb-2 overflow-hidden relative">
                          <div className="flex justify-between items-center text-[9px] font-mono text-[#769EFD] font-bold">
                            <span>BIOACOUSTICS RIG</span>
                            <span>AI LISTENING</span>
                          </div>
                          <div className="flex-1 flex items-center justify-center">
                            <svg viewBox="0 0 100 40" className="w-28 h-10 stroke-[#769EFD] fill-none" strokeWidth="1.5">
                              <path d="M 10 25 Q 35 12 60 18 Q 85 22 90 12 Q 85 30 65 32 Q 35 34 10 25 Z" fill="#769EFD" fillOpacity="0.15" />
                              <circle cx="50" cy="20" r="2" fill="#769EFD" />
                            </svg>
                          </div>
                          <div className="text-[9px] text-[#8ea8d8] font-mono">
                            Speculative Hydrophone Apparatus
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">🐋</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight">
                              Cetacean Communication Station
                            </h3>
                            <div className="text-[10px] text-[#555]">
                              Speculative Designer & Filmmaker
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                        <span className="bg-white px-1.5 py-0.2 border border-[#808080] font-mono text-[#333]">
                          The Cinema
                        </span>
                        <span className="text-[#000080] font-bold group-hover:underline">
                          Open File ➔
                        </span>
                      </div>
                    </article>

                    {/* Card 5: The House of Leaves 3D ASCII Engine */}
                    <article
                      onClick={() => {
                        window.location.href = "/";
                      }}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 flex flex-col justify-between hover:bg-[#d4d0c8] transition-colors cursor-pointer shadow-xs group"
                    >
                      <div>
                        {/* Inset Thumbnail Window (ASCII Room Mockup) */}
                        <div className="aspect-[16/10] bg-[#060605] text-[#dedad0] font-mono text-[8px] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2 flex flex-col justify-between mb-2 overflow-hidden select-none">
                          <div className="flex justify-between items-center text-[#769EFD] font-bold">
                            <span>[3D_ASCII_ENGINE]</span>
                            <span>60_FPS</span>
                          </div>
                          <pre className="text-center leading-[8px] text-[7px] my-auto text-[#aaa]">
                            {`  +=============+
 /|  [HOUSE]   /|
+-+-----------+-+
| |  ROOM 02  | |
| |   * = @   | |
+-+-----------+-+`}
                          </pre>
                          <div className="text-[8px] text-[#769EFD]">
                            Navigable House of Leaves
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">🏠</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight">
                              The House of Leaves Engine
                            </h3>
                            <div className="text-[10px] text-[#555]">
                              Interactive 3D WebGL ASCII Spatial Website
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                        <span className="bg-white px-1.5 py-0.2 border border-[#808080] font-mono text-[#333]">
                          Wander Mode
                        </span>
                        <span className="text-[#000080] font-bold group-hover:underline">
                          Launch 3D ➔
                        </span>
                      </div>
                    </article>

                    {/* Card 6: Component Token Matrix Specimen */}
                    <article
                      onClick={() => setSelectedProjectId("selected-ui-ux")}
                      className="bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] p-2.5 flex flex-col justify-between hover:bg-[#d4d0c8] transition-colors cursor-pointer shadow-xs group"
                    >
                      <div>
                        {/* Inset Thumbnail Window */}
                        <div className="aspect-[16/10] bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-2.5 flex flex-col justify-between mb-2 overflow-hidden relative">
                          <div className="flex justify-between items-center text-[9px] font-mono text-[#333] font-bold">
                            <span>DESIGN TOKENS</span>
                            <span>FOUNDATIONS</span>
                          </div>
                          <div className="space-y-1 my-auto">
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 bg-[#769EFD] rounded-xs inline-block" />
                              <span className="font-mono text-[9px] text-[#444]">color.interactive.769efd</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 bg-[#1e3570] rounded-xs inline-block" />
                              <span className="font-mono text-[9px] text-[#444]">color.chassis.1e3570</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-3 h-3 bg-[#0a0a09] rounded-xs inline-block" />
                              <span className="font-mono text-[9px] text-[#444]">space.grid.unit-8px</span>
                            </div>
                          </div>
                          <div className="text-[9px] text-[#666] font-mono">
                            WCAG AA Compliant Ramps
                          </div>
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex items-start gap-2">
                          <span className="text-base shrink-0">📊</span>
                          <div className="min-w-0">
                            <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight">
                              Token Matrix & Foundations
                            </h3>
                            <div className="text-[10px] text-[#555]">
                              Design Systems Component Specimen
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                        <span className="bg-white px-1.5 py-0.2 border border-[#808080] font-mono text-[#333]">
                          Living Room
                        </span>
                        <span className="text-[#000080] font-bold group-hover:underline">
                          View Specs ➔
                        </span>
                      </div>
                    </article>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: SKILLS & CAPABILITIES */}
            {activeTab === "skills" && (
              <section aria-labelledby="skills-heading" className="space-y-4">
                <div className="border-b-2 border-[#808080] pb-2">
                  <h2 id="skills-heading" className="text-base font-bold text-black">
                    Capabilities & Core Competencies
                  </h2>
                  <p className="text-xs text-[#444]">
                    Systems architecture, ethnographic research methods, and technical implementation.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category 1 */}
                  <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-4 space-y-2">
                    <h3 className="font-bold text-xs text-[#000080] border-b border-[#ddd] pb-1">
                      1. Product Design & Interaction Architecture
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#333]">
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Design Systems & Token Architecture:</strong> Engineering scalable design tokens across typography, color, spacing, and multi-platform component libraries.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Information Architecture & Mental Models:</strong> Structuring complex data models into clear, frictionless interface navigation schemas.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Interactive Prototyping:</strong> Micro-interactions, multi-state transitions, responsive breakpoints, and edge-case handling.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Category 2 */}
                  <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-4 space-y-2">
                    <h3 className="font-bold text-xs text-[#000080] border-b border-[#ddd] pb-1">
                      2. Situated Research & Service Design
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#333]">
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Ethnographic Observation:</strong> Qualitative semi-structured interviews, field journals, and participant spatial tracking.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Service Ecologies & Blueprints:</strong> Translating fieldwork into visual service ecologies capturing institutional barriers and community networks.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Participatory Mapping:</strong> Engaging non-technical stakeholders in collaborative spatial journey mapping.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Category 3 */}
                  <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-4 space-y-2">
                    <h3 className="font-bold text-xs text-[#000080] border-b border-[#ddd] pb-1">
                      3. Speculative Design, AI & Media
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#333]">
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Interspecies Bioacoustics:</strong> Machine listening apparatus, transducer hardware concepts, and non-linear audio models.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Moving Image & Sound:</strong> Cinematic simulations, projection atmospheres, and spatialized audio.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Material & Book Arts:</strong> Sequential ink publishing, printmaking resistances, and tactile book structures.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Category 4 */}
                  <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-4 space-y-2">
                    <h3 className="font-bold text-xs text-[#000080] border-b border-[#ddd] pb-1">
                      4. Technical Implementation & Creative Technology
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#333]">
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Real-Time 3D & WebGL:</strong> Three.js scene graphs, custom ASCII rasterizer pipelines, shaders, and collision geometry.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Front-End Engineering:</strong> TypeScript, Next.js, React, Tailwind CSS, performance tuning, and 60 FPS animation loops.</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span>•</span>
                        <span><strong>Accessibility:</strong> WCAG AA contrast standards, keyboard navigation, semantic HTML, and ARIA patterns.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* TAB 3: ABOUT & EXPERIENCE */}
            {activeTab === "about" && (
              <section aria-labelledby="about-heading" className="space-y-4">
                <div className="border-b-2 border-[#808080] pb-2">
                  <h2 id="about-heading" className="text-base font-bold text-black">
                    About Ashani Gorakhnath
                  </h2>
                  <p className="text-xs text-[#444]">
                    Lead Product Designer, Systems Architect & Design Researcher.
                  </p>
                </div>

                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-5 space-y-4 text-xs leading-relaxed text-[#222]">
                  <div>
                    <h3 className="font-bold text-sm text-[#000080] mb-1">
                      Practice Philosophy
                    </h3>
                    <p>
                      I design digital product systems, interaction architectures, and research methodologies that bridge rigorous systems thinking with deep human tactility. My work spans two complementary worlds: engineering scalable, accessible design token architectures for production software tools, and conducting grounded ethnographic fieldwork that learns directly from people in place.
                    </p>
                  </div>

                  <div className="border-t border-[#eee] pt-3">
                    <h3 className="font-bold text-sm text-[#000080] mb-1">
                      The Portfolio House Metaphor
                    </h3>
                    <p>
                      Rather than a conventional flat website grid, my creative body of work is organized as a house inspired by the endless, unsettling architecture of <em>House of Leaves</em>. In <strong>Wander Mode</strong>, visitors physically step into a real-time 3D ASCII house, entering rooms dedicated to different practices (The Studio, The Workroom, The Library, The Cinema). In <strong>Work Mode</strong> (this page), recruiters can inspect every case study, design system, and qualitative inquiry with speed, clarity, and precision.
                    </p>
                  </div>

                  <div className="border-t border-[#eee] pt-3">
                    <h3 className="font-bold text-sm text-[#000080] mb-2">
                      Selected Practice Domains
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div className="bg-[#f8f9fa] p-2.5 border border-[#ddd]">
                        <span className="font-bold text-[#000080] block mb-0.5">The Studio (Product Systems)</span>
                        Production UX/UI, relational data hierarchies, multi-platform tokens, state machines.
                      </div>
                      <div className="bg-[#f8f9fa] p-2.5 border border-[#ddd]">
                        <span className="font-bold text-[#000080] block mb-0.5">The Workroom (Ethnography)</span>
                        Situated field observations, community interviews, geographic service blueprints.
                      </div>
                      <div className="bg-[#f8f9fa] p-2.5 border border-[#ddd]">
                        <span className="font-bold text-[#000080] block mb-0.5">The Library (Tactile Print)</span>
                        Sequential visual narrative, printmaking resistances, manual dexterity and touch.
                      </div>
                      <div className="bg-[#f8f9fa] p-2.5 border border-[#ddd]">
                        <span className="font-bold text-[#000080] block mb-0.5">The Cinema (Speculative Sound)</span>
                        Interspecies machine listening, bioacoustic transducers, moving image projections.
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* TAB 4: CONTACT */}
            {activeTab === "contact" && (
              <section id="contact" aria-labelledby="contact-heading" className="space-y-4">
                <div className="border-b-2 border-[#808080] pb-2">
                  <h2 id="contact-heading" className="text-base font-bold text-black">
                    Contact & Professional Inquiry
                  </h2>
                  <p className="text-xs text-[#444]">
                    Let us discuss product design leadership, design systems, or situated research.
                  </p>
                </div>

                <div className="bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] p-5 space-y-4 max-w-xl text-xs">
                  <div className="space-y-2">
                    <div className="font-bold text-xs text-[#333]">
                      Direct Email:
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value="ashani.gorakhnath@gmail.com"
                        className="bg-[#f0f0f0] border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] px-3 py-1.5 text-xs font-mono font-bold text-[#000080] flex-1"
                      />
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className="px-3 py-1.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] active:border-t-[#808080] active:border-l-[#808080] active:border-b-[#ffffff] active:border-r-[#ffffff] font-bold text-xs cursor-pointer"
                      >
                        {copiedEmail ? "Copied! ✓" : "Copy"}
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-[#eee] pt-3 space-y-2">
                    <div className="font-bold text-xs text-[#333]">
                      Professional Links:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] font-bold text-xs hover:bg-[#d0d0d0]"
                      >
                        GitHub &rarr;
                      </a>
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#808080] border-r-[#808080] font-bold text-xs hover:bg-[#d0d0d0]"
                      >
                        LinkedIn &rarr;
                      </a>
                      <Link
                        href="/"
                        className="px-3 py-1 bg-[#d8f0d8] border border-[#2b882b] font-bold text-xs text-[#115511] hover:bg-[#c4ecc4]"
                      >
                        Explore 3D ASCII House &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* 5. Status Bar */}
        <footer className="h-6 bg-[#c0c0c0] border-t-2 border-[#808080] px-3 flex items-center justify-between text-[11px] text-[#444] select-none">
          <div className="flex items-center gap-3">
            <span>Mode: Professional Portfolio (Recruiter Mode)</span>
            <span className="border-l border-[#808080] pl-2 hidden sm:inline">
              Location: /work
            </span>
          </div>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <Link href="/" className="text-[#000080] font-bold hover:underline flex items-center gap-1">
              <span>[ Switch to 3D Wander Mode ]</span>
            </Link>
          </div>
        </footer>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          COMPREHENSIVE CASE STUDY MODAL (All 8 Recruiter Priority Fields)
          ───────────────────────────────────────────────────────────── */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="case-study-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs font-sans text-xs"
          onClick={() => setSelectedProjectId(null)}
        >
          <div
            className="w-full max-w-3xl bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Title Bar */}
            <div className="h-8 bg-[#000080] text-white px-2.5 flex items-center justify-between font-bold text-xs">
              <div className="flex items-center gap-2 truncate">
                <span>📄</span>
                <span id="case-study-title" className="truncate">
                  {selectedProject.title} — Case Study Dossier
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="w-5 h-5 bg-[#c0c0c0] text-black font-bold text-xs flex items-center justify-center border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Inset Body */}
            <div className="flex-1 bg-white p-4 sm:p-6 overflow-y-auto space-y-4 text-black border-2 border-t-[#808080] border-l-[#808080] border-b-[#ffffff] border-r-[#ffffff] m-2">
              {/* Header: Title, Subtitle, Category & Room */}
              <div className="border-b border-[#ddd] pb-3">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="bg-[#eef4ff] text-[#000080] text-[10px] font-bold px-2 py-0.5 rounded border border-[#bcd3ff]">
                    {selectedProject.category}
                  </span>
                  <span className="bg-[#f0f0f0] text-[#555] text-[10px] font-mono px-2 py-0.5 border border-[#ddd]">
                    {selectedProject.roomName} ({selectedProject.roomId})
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#000080]">
                  {selectedProject.title}
                </h2>
                <p className="text-xs text-[#555] mt-0.5">
                  {selectedProject.subtitle}
                </p>
              </div>

              {/* 1. ROLE */}
              <div className="bg-[#f5f8ff] border-l-4 border-[#000080] p-3 rounded-r">
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#000080]">
                  1. Role:
                </div>
                <div className="text-xs font-bold text-black mt-0.5">
                  {selectedProject.role || "Lead Designer & Architect"}
                </div>
              </div>

              {/* 2. WHAT I DID */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-1">
                  2. What I Did (Executive Scope):
                </div>
                <p className="text-xs text-[#222] leading-relaxed bg-[#fafafa] p-3 border border-[#e5e5e5]">
                  {selectedProject.summary}
                </p>
              </div>

              {/* 3. CONTEXT */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-1">
                  3. Context:
                </div>
                <p className="text-xs text-[#333] leading-relaxed bg-[#fafafa] p-3 border border-[#e5e5e5]">
                  {selectedProject.context}
                </p>
              </div>

              {/* 4. KEY DESIGN PROBLEM */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-1">
                  4. Key Design Problem:
                </div>
                <p className="text-xs text-[#222] leading-relaxed bg-[#fafafa] p-3 border border-[#e5e5e5]">
                  {selectedProject.overview}
                </p>
              </div>

              {/* 5. APPROACH & PROCESS */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-1.5">
                  5. Approach & Process:
                </div>
                <div className="space-y-2.5">
                  {selectedProject.processPoints?.map((pt, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-[#fafafa] border border-[#e5e5e5] rounded-xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 bg-[#000080] text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <h3 className="font-bold text-xs text-[#000080]">
                          {pt.title}
                        </h3>
                      </div>
                      <p className="text-xs text-[#444] leading-relaxed pl-7">
                        {pt.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. OUTCOME */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-1">
                  6. Measurable Outcome & Delivery:
                </div>
                <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-xs text-[#166534] leading-relaxed font-semibold">
                  ✓ {selectedProject.outcomesPlaceholder}
                </div>
              </div>

              {/* 7. RELEVANT SKILLS */}
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#666] mb-1.5">
                  7. Relevant Skills & Disciplines:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.disciplines.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 bg-[#eef4ff] text-[#000080] border border-[#bcd3ff] text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="h-11 bg-[#c0c0c0] px-3 flex items-center justify-between border-t-2 border-[#808080]">
              <Link
                href="/"
                className="text-[11px] text-[#000080] font-bold hover:underline flex items-center gap-1"
              >
                <span>🏠 Explore object in 3D House ({selectedProject.roomName}) &rarr;</span>
              </Link>

              <button
                type="button"
                onClick={() => setSelectedProjectId(null)}
                className="px-4 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
