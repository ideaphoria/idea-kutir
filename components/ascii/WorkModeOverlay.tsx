"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { InteractiveObject3D } from "@/data/house3d";
import {
  DirectoryCategory,
  DirectoryItem,
  DirectoryRoom,
  getDirectoryRooms,
  getDirectoryStats,
  findInteractiveObject,
  DIRECTORY_ROOM_META,
} from "@/data/directoryData";

interface WorkModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject?: (projectId: string) => void;
  currentRoomId: string;
  selectedProjectId?: string | null;
  onSelectProjectId?: (id: string | null) => void;
  onOpenObjectInspector?: (object: InteractiveObject3D) => void;
  onOpenProjectDirectory?: (projectId?: string) => void;
  onOpenProfile?: () => void;
  onOpenMap?: () => void;
  onNavigateToRoom?: (roomId: string) => void;
}

export default function WorkModeOverlay({
  isOpen,
  onClose,
  onSelectProject,
  currentRoomId,
  selectedProjectId,
  onSelectProjectId,
  onOpenObjectInspector,
  onOpenProjectDirectory,
  onOpenProfile,
  onOpenMap,
  onNavigateToRoom,
}: WorkModeOverlayProps) {
  // Navigation Layer 1: Top Category
  const [activeCategory, setActiveCategory] = useState<DirectoryCategory>("ALL WORK");

  // Navigation Layer 2: Selected Room in Left Tree / Main Panel
  const [selectedRoomId, setSelectedRoomId] = useState<string>("living_room");

  // Expand / collapse state for tree nodes
  const [isRootExpanded, setIsRootExpanded] = useState<boolean>(true);
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>({
    entrance_hall: true,
    living_room: true,
    study: true,
    art_room: true,
  });

  // Mobile drawer toggle for left tree
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  // Active view mode: Details table vs Card List
  const [viewMode, setViewMode] = useState<"details" | "cards">("details");

  // Refs for scrolling to room sections in main panel
  const roomSectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Get filtered rooms and items for current category
  const filteredRooms = useMemo(() => {
    return getDirectoryRooms(activeCategory);
  }, [activeCategory]);

  // Directory statistics
  const stats = useMemo(() => {
    return getDirectoryStats(activeCategory);
  }, [activeCategory]);

  // Keep selectedRoomId valid when category changes
  useEffect(() => {
    if (filteredRooms.length > 0 && !filteredRooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId]);

  // Toggle tree node expansion
  const toggleRoomExpand = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  // Handle clicking a room in the tree
  const handleSelectRoomNode = (roomId: string) => {
    setSelectedRoomId(roomId);
    setShowMobileSidebar(false);
    onNavigateToRoom?.(roomId);

    // Smooth scroll to corresponding room section
    const targetEl = roomSectionRefs.current[roomId];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle item actions
  const handleItemAction = (item: DirectoryItem) => {
    // 1. Orient 3D camera to item's room
    onNavigateToRoom?.(item.roomId);
    if (item.canonicalProjectId) {
      onSelectProject?.(item.canonicalProjectId);
      onSelectProjectId?.(item.canonicalProjectId);
    }

    // 2. Dispatch specific action destination
    switch (item.actionType) {
      case "external_url":
        if (item.targetUrl) {
          if (typeof window !== "undefined") {
            window.open(item.targetUrl, "_blank", "noopener,noreferrer");
          }
        }
        break;

      case "open_directory":
        onOpenProjectDirectory?.(item.id);
        break;

      case "open_profile":
        onOpenProfile?.();
        break;

      case "open_map":
        onOpenMap?.();
        break;

      case "inspect_object":
        if (item.interactiveObjectId) {
          const obj = findInteractiveObject(item.interactiveObjectId);
          if (obj && onOpenObjectInspector) {
            onOpenObjectInspector(obj);
          }
        }
        break;
    }
  };

  if (!isOpen) return null;

  const selectedRoomMeta = DIRECTORY_ROOM_META[selectedRoomId] || DIRECTORY_ROOM_META["living_room"];

  return (
    <div
      role="region"
      aria-label="Windows 95 House Directory"
      className="fixed inset-0 z-40 overflow-y-auto pt-10 sm:pt-12 pb-4 px-2 sm:px-4 md:px-6 flex flex-col justify-start bg-black/25 backdrop-blur-[1px] pointer-events-auto selection:bg-[#000080] selection:text-white font-sans text-xs"
    >
      {/* ─────────────────────────────────────────────────────────────
          WINDOWS 95 / 98 EXPLORER DIRECTORY WINDOW
          Light gray (#c0c0c0) chassis, raised & sunken 3D borders
          ───────────────────────────────────────────────────────────── */}
      <main className="w-full max-w-7xl mx-auto bg-[#c0c0c0] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#404040] border-r-[#404040] shadow-2xl flex flex-col my-auto select-none">
        {/* 1. Title Bar (Classic Windows Navy Gradient) */}
        <header className="h-8 bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white px-2 flex items-center justify-between font-bold text-xs select-none shadow-inner">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src="/icons/win95/room-computer.svg"
              alt="Directory Icon"
              className="w-4 h-4 shrink-0"
            />
            <h1 className="text-xs truncate tracking-wide font-sans">
              Idea Kutir — House Directory (C:\IdeaKutir\GroundFloor)
            </h1>
          </div>

          {/* Windows Titlebar Control Buttons */}
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <button
              type="button"
              className="w-4 h-4 bg-[#c0c0c0] text-black font-bold text-[10px] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white flex items-center justify-center cursor-default leading-none"
              title="Minimize"
              tabIndex={-1}
            >
              _
            </button>
            <button
              type="button"
              className="w-4 h-4 bg-[#c0c0c0] text-black font-bold text-[10px] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white flex items-center justify-center cursor-default leading-none"
              title="Maximize"
              tabIndex={-1}
            >
              □
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-4 h-4 bg-[#c0c0c0] hover:bg-[#d4d0c8] text-black font-bold text-[10px] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white flex items-center justify-center cursor-pointer leading-none"
              title="Close Directory (Return to Play House)"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </header>

        {/* 2. Menu Bar (Classic Windows Explorer Menu) */}
        <div className="bg-[#c0c0c0] px-2 py-0.5 border-b border-[#808080] flex items-center gap-4 text-xs text-black">
          <span className="hover:bg-[#000080] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">F</span>ile
          </span>
          <span className="hover:bg-[#000080] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">E</span>dit
          </span>
          <span className="hover:bg-[#000080] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">V</span>iew
          </span>
          <span className="hover:bg-[#000080] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">G</span>o
          </span>
          <span className="hover:bg-[#000080] hover:text-white px-1.5 py-0.5 cursor-pointer">
            Fa<span className="underline">v</span>orites
          </span>
          <span className="hover:bg-[#000080] hover:text-white px-1.5 py-0.5 cursor-pointer">
            <span className="underline">H</span>elp
          </span>

          <div className="ml-auto text-[10px] text-[#555] font-mono hidden sm:inline">
            Windows 95 Portfolio Explorer
          </div>
        </div>

        {/* 3. Toolbar (Up Folder, Views, Mobile Folders Toggle, Play House) */}
        <div className="bg-[#c0c0c0] p-1.5 border-b border-[#808080] flex flex-wrap items-center gap-2 text-xs">
          {/* Up Navigation Button */}
          <button
            type="button"
            onClick={() => handleSelectRoomNode("entrance_hall")}
            className="px-2 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white flex items-center gap-1.5 cursor-pointer"
            title="Up One Level (C:\IdeaKutir\GroundFloor)"
          >
            <img src="/icons/win95/nav-up.svg" alt="Up" className="w-3.5 h-3.5" />
            <span>Up</span>
          </button>

          {/* Mobile Sidebar Toggle Button */}
          <button
            type="button"
            onClick={() => setShowMobileSidebar(!showMobileSidebar)}
            className="md:hidden px-2 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white flex items-center gap-1.5 cursor-pointer"
          >
            <img src="/icons/win95/folder-closed.svg" alt="Folders" className="w-3.5 h-3.5" />
            <span>Folders</span>
          </button>

          <div className="h-5 w-[1px] bg-[#808080] border-r border-white mx-0.5" />

          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode("details")}
              className={`px-2 py-0.5 border text-xs cursor-pointer ${
                viewMode === "details"
                  ? "bg-[#d8d8d8] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold"
                  : "bg-[#c0c0c0] border-t-white border-l-white border-b-[#404040] border-r-[#404040]"
              }`}
              title="Details View"
            >
              ≡ Details
            </button>
            <button
              type="button"
              onClick={() => setViewMode("cards")}
              className={`px-2 py-0.5 border text-xs cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#d8d8d8] border-t-[#404040] border-l-[#404040] border-b-white border-r-white font-bold"
                  : "bg-[#c0c0c0] border-t-white border-l-white border-b-[#404040] border-r-[#404040]"
              }`}
              title="Cards View"
            >
              :: Cards
            </button>
          </div>

          {/* Play House Switch Button */}
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 bg-[#d8f0d8] hover:bg-[#c0e8c0] text-[#006600] font-bold border border-t-white border-l-white border-b-[#2e602e] border-r-[#2e602e] active:border-t-[#2e602e] active:border-l-[#2e602e] active:border-b-white active:border-r-white flex items-center gap-1.5 cursor-pointer"
              title="Exit Work Mode and return to Play House"
            >
              <span>🏠</span>
              <span>Switch to Play House</span>
            </button>
          </div>
        </div>

        {/* 4. Address Bar */}
        <div className="bg-[#c0c0c0] px-2 py-1 border-b-2 border-[#808080] flex items-center gap-2 text-xs">
          <span className="text-[#333] shrink-0">Address</span>
          <div className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 flex items-center gap-1.5 min-w-0">
            <img
              src={selectedRoomMeta.icon}
              alt=""
              className="w-3.5 h-3.5 shrink-0"
            />
            <span className="font-mono text-xs text-black truncate">
              {selectedRoomMeta.folderPath}
            </span>
          </div>
        </div>

        {/* 5. Navigation Layer 1: Top Category Tabs */}
        <nav
          aria-label="Project Category Tabs"
          className="bg-[#c0c0c0] px-2 pt-1.5 border-b-2 border-[#808080] flex flex-wrap items-end gap-1 text-xs"
        >
          {(
            [
              { id: "ALL WORK", label: "ALL WORK", count: 21 },
              { id: "UI / UX", label: "UI / UX", count: 7 },
              { id: "ILLUSTRATION", label: "ILLUSTRATION", count: 8 },
              { id: "ACADEMIC PROJECTS", label: "ACADEMIC PROJECTS", count: 2 },
            ] as const
          ).map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1 font-medium border-t-2 border-l-2 border-r-2 transition-none cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-[#c0c0c0] border-t-white border-l-white border-r-[#404040] font-bold text-black relative top-[2px] z-10 shadow-xs"
                    : "bg-[#b0b0b0] border-t-[#dfdfdf] border-l-[#dfdfdf] border-r-[#707070] text-[#333] hover:bg-[#b8b8b8]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1 rounded-none text-[10px] font-mono ${
                    isActive ? "bg-[#000080] text-white" : "bg-[#808080] text-white"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>

        {/* 6. Two-Pane Layout: Left Explorer Tree Sidebar + Main Room-Grouped Panel */}
        <div className="flex flex-col md:flex-row flex-1 min-h-[540px] max-h-[72vh] overflow-hidden">
          {/* Navigation Layer 2: Left Windows Explorer Tree Sidebar */}
          <aside
            aria-label="Windows Explorer Tree"
            className={`${
              showMobileSidebar ? "block" : "hidden"
            } md:block w-full md:w-64 lg:w-72 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-2 overflow-y-auto shrink-0 m-1 md:mr-0 text-xs font-sans`}
          >
            <div className="text-[11px] font-bold text-[#444] mb-1.5 uppercase tracking-wider px-1 flex items-center justify-between border-b border-[#eee] pb-1">
              <span>All Folders</span>
              <span className="font-mono text-[10px] text-[#888]">{stats.roomsCount} rooms</span>
            </div>

            {/* Root Drive: Idea Kutir (C:) */}
            <div className="space-y-0.5">
              <div
                onClick={() => setIsRootExpanded(!isRootExpanded)}
                className="flex items-center gap-1.5 py-0.5 px-1 hover:bg-[#eef] cursor-pointer"
              >
                <img
                  src={isRootExpanded ? "/icons/win95/tree-collapse.svg" : "/icons/win95/tree-expand.svg"}
                  alt=""
                  className="w-2.5 h-2.5 shrink-0"
                />
                <img
                  src="/icons/win95/room-computer.svg"
                  alt=""
                  className="w-4 h-4 shrink-0"
                />
                <span className="font-bold text-black">Ground Floor (C:)</span>
              </div>

              {/* Ground Floor Rooms List (Strict Ground-Floor Only Scope) */}
              {isRootExpanded && (
                <div className="pl-4 space-y-1 border-l border-dotted border-[#aaa] ml-2 mt-0.5">
                  {filteredRooms.map((room) => {
                    const isRoomSelected = selectedRoomId === room.id;
                    const isExpanded = !!expandedRooms[room.id];

                    return (
                      <div key={room.id} className="space-y-0.5">
                        {/* Room Node */}
                        <div
                          onClick={() => handleSelectRoomNode(room.id)}
                          className={`flex items-center gap-1.5 py-1 px-1.5 cursor-pointer rounded-none group ${
                            isRoomSelected
                              ? "bg-[#000080] text-white font-bold"
                              : "hover:bg-[#d8e4f8] text-black"
                          }`}
                        >
                          {/* [+] / [-] Toggle for room's items */}
                          <button
                            type="button"
                            onClick={(e) => toggleRoomExpand(room.id, e)}
                            className="p-0.5 hover:bg-black/10 shrink-0 cursor-pointer"
                            title={isExpanded ? "Collapse" : "Expand"}
                          >
                            <img
                              src={
                                isExpanded
                                  ? "/icons/win95/tree-collapse.svg"
                                  : "/icons/win95/tree-expand.svg"
                              }
                              alt=""
                              className="w-2.5 h-2.5"
                            />
                          </button>

                          {/* Room Icon (Custom pixel-art for Living Room, Study, Art Room; Manila folder for Entrance Hall) */}
                          <img
                            src={isExpanded ? room.openIcon : room.icon}
                            alt=""
                            className="w-4 h-4 shrink-0"
                          />

                          {/* Room Title & Count */}
                          <span className="truncate flex-1">{room.name}</span>
                          <span
                            className={`font-mono text-[10px] shrink-0 ${
                              isRoomSelected ? "text-white/80" : "text-[#666]"
                            }`}
                          >
                            ({room.itemCount})
                          </span>
                        </div>

                        {/* Nested Items Under Room */}
                        {isExpanded && (
                          <div className="pl-5 space-y-0.5 border-l border-dotted border-[#aaa] ml-3.5 my-0.5">
                            {room.items.map((item) => {
                              const isItemSelected = selectedProjectId === item.canonicalProjectId;

                              return (
                                <div
                                  key={item.id}
                                  onClick={() => handleItemAction(item)}
                                  className={`flex items-center gap-1.5 py-0.5 px-1 cursor-pointer truncate ${
                                    isItemSelected
                                      ? "bg-[#1084d0] text-white font-semibold"
                                      : "hover:bg-[#f0f4fa] text-[#222]"
                                  }`}
                                  title={`${item.title} — ${item.specimenType}`}
                                >
                                  <img
                                    src={item.icon}
                                    alt=""
                                    className="w-3.5 h-3.5 shrink-0"
                                  />
                                  <span className="truncate text-[11px]">{item.title}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          {/* Main Panel: Projects Grouped by Room */}
          <section
            aria-label="Projects Grouped by Room"
            className="flex-1 bg-white border-2 border-t-[#808080] border-l-[#808080] border-b-white border-r-white p-2 sm:p-3 overflow-y-auto m-1 flex flex-col gap-4 text-xs font-sans"
          >
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                ref={(el) => {
                  roomSectionRefs.current[room.id] = el;
                }}
                className="space-y-2"
              >
                {/* Room Section Header (with Custom Room Icon) */}
                <div className="bg-[#e4e4e4] border border-t-white border-l-white border-b-[#808080] border-r-[#808080] p-2 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={room.icon}
                      alt={room.name}
                      className="w-6 h-6 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-black flex items-center gap-2">
                        <span>{room.name}</span>
                        <span className="bg-[#000080] text-white px-1.5 py-0.2 text-[10px] font-mono">
                          {room.itemCount} items
                        </span>
                      </div>
                      <div className="text-[10px] text-[#666] font-mono truncate">
                        {room.folderPath}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectRoomNode(room.id)}
                    className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#d0d0d0] border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white text-[11px] font-medium shrink-0 cursor-pointer"
                  >
                    Focus Room ➔
                  </button>
                </div>

                {/* VIEW MODE 1: DETAILS TABLE (Period-Accurate Windows 95 Explorer View) */}
                {viewMode === "details" && (
                  <div className="overflow-x-auto border border-[#ccc]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#c0c0c0] border-b border-[#808080] text-black font-bold">
                          <th className="py-1 px-2 border-r border-t-white border-l-white border-[#808080] w-1/3">
                            Name
                          </th>
                          <th className="py-1 px-2 border-r border-t-white border-l-white border-[#808080] w-1/5">
                            Specimen Type
                          </th>
                          <th className="py-1 px-2 border-r border-t-white border-l-white border-[#808080] w-1/6 hidden sm:table-cell">
                            Size
                          </th>
                          <th className="py-1 px-2 border-r border-t-white border-l-white border-[#808080] w-1/6 hidden md:table-cell">
                            Modified
                          </th>
                          <th className="py-1 px-2 border-t-white border-l-white border-[#808080] text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {room.items.map((item, idx) => (
                          <tr
                            key={item.id}
                            className={`border-b border-[#eee] hover:bg-[#eef4ff] cursor-pointer ${
                              idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                            }`}
                            onClick={() => handleItemAction(item)}
                          >
                            <td className="py-1.5 px-2 flex items-start gap-2 min-w-0">
                              <img
                                src={item.icon}
                                alt=""
                                className="w-4 h-4 mt-0.5 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="font-bold text-black hover:text-[#000080] leading-tight truncate">
                                  {item.title}
                                </div>
                                <div className="text-[10px] text-[#666] leading-tight truncate">
                                  {item.subtitle}
                                </div>
                              </div>
                            </td>
                            <td className="py-1.5 px-2 text-[#444] font-mono text-[11px] truncate">
                              {item.specimenType}
                            </td>
                            <td className="py-1.5 px-2 text-[#666] font-mono text-[11px] hidden sm:table-cell">
                              {item.fileSize || "42 KB"}
                            </td>
                            <td className="py-1.5 px-2 text-[#666] font-mono text-[11px] hidden md:table-cell">
                              {item.modifiedDate || "2024-11-01"}
                            </td>
                            <td className="py-1.5 px-2 text-right shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleItemAction(item);
                                }}
                                className="px-2.5 py-1 bg-[#c0c0c0] hover:bg-[#d0d0d0] text-black font-bold text-xs border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white shadow-xs cursor-pointer whitespace-nowrap"
                              >
                                {item.actionLabel}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* VIEW MODE 2: CARDS GRID */}
                {viewMode === "cards" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {room.items.map((item) => (
                      <article
                        key={item.id}
                        onClick={() => handleItemAction(item)}
                        className="bg-[#c0c0c0] border-2 border-t-white border-l-white border-b-[#404040] border-r-[#404040] p-2.5 flex flex-col justify-between hover:bg-[#d8d4cc] transition-none cursor-pointer shadow-xs group"
                      >
                        <div>
                          {/* Card Top Details */}
                          <div className="flex items-start gap-2 mb-2">
                            <img
                              src={item.icon}
                              alt=""
                              className="w-5 h-5 shrink-0 mt-0.5"
                            />
                            <div className="min-w-0">
                              <h3 className="font-bold text-xs text-black group-hover:text-[#000080] leading-tight truncate">
                                {item.title}
                              </h3>
                              <div className="text-[10px] text-[#555] leading-tight truncate">
                                {item.subtitle}
                              </div>
                            </div>
                          </div>

                          <p className="text-[11px] text-[#333] line-clamp-2 bg-white p-1.5 border border-[#808080] leading-snug">
                            {item.description}
                          </p>
                        </div>

                        <div className="mt-2.5 pt-1.5 border-t border-[#a0a0a0] flex items-center justify-between text-[10px]">
                          <span className="font-mono text-[#555]">
                            {item.specimenType}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleItemAction(item);
                            }}
                            className="px-2 py-0.5 bg-[#c0c0c0] hover:bg-[#e0e0e0] font-bold text-black border border-t-white border-l-white border-b-[#404040] border-r-[#404040] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white shadow-xs cursor-pointer"
                          >
                            {item.actionLabel}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </section>
        </div>

        {/* 7. Bottom Status Bar (Windows 95 Inset Panels) */}
        <footer className="h-6 bg-[#c0c0c0] border-t-2 border-[#808080] px-2 flex items-center justify-between text-[11px] text-black select-none gap-2">
          {/* Panel 1: Visible Items & Unique Projects Count */}
          <div className="bg-[#c0c0c0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 truncate shrink-0">
            <span>
              <strong>{stats.totalItems}</strong> object(s) visible (
              <strong>{stats.uniqueProjectsCount}</strong> unique projects)
            </span>
          </div>

          {/* Panel 2: Active Category */}
          <div className="bg-[#c0c0c0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 hidden sm:block truncate shrink-0">
            <span>Category: {activeCategory}</span>
          </div>

          {/* Panel 3: Active Room */}
          <div className="bg-[#c0c0c0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 hidden md:block flex-1 truncate">
            <span>Ground Floor · Active: {selectedRoomMeta.name}</span>
          </div>

          {/* Panel 4: Play House Shortcut */}
          <div className="bg-[#c0c0c0] border border-t-[#808080] border-l-[#808080] border-b-white border-r-white px-2 py-0.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="text-[#000080] font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>[ Return to Play House ]</span>
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
