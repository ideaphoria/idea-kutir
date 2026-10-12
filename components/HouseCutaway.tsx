"use client";

import { useState } from "react";
import { COLLECTIBLE_OBJECTS } from "@/data/house";

interface HouseCutawayProps {
  mode: "work" | "wander";
  onSelectRoom: (roomId: string) => void;
  onSelectObject: (objectId: string) => void;
  activeRoomId?: string;
  collectedObjectIds?: string[];
}

export default function HouseCutaway({
  mode,
  onSelectRoom,
  onSelectObject,
  activeRoomId,
  collectedObjectIds,
}: HouseCutawayProps) {
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

  const isNight = mode === "wander";
  const isRoomActive = (id: string) => hoveredRoom === id || activeRoomId === id;
  const isObjCollected = (id: string) => Boolean(collectedObjectIds?.includes(id));

  return (
    <div className="relative w-full max-w-5xl mx-auto my-6 select-none">
      
      {/* ─────────────────────────────────────────────────────────────
          ARCHITECTURAL CUTAWAY HOUSE
          Full responsive SVG cutaway of Ashani's House & Studio
          ───────────────────────────────────────────────────────────── */}
      <div
        className={`relative w-full aspect-[16/11] sm:aspect-[16/10] md:aspect-[16/9.5] rounded-xl overflow-hidden border-2 transition-colors duration-700 shadow-xl ${
          isNight
            ? "bg-[#0E0D0B] border-[#2A2722] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)]"
            : "bg-[#F3EFE6] border-[#1A1918]/25 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)]"
        }`}
      >
        {/* SVG Drawing Layer */}
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients for Day and Night lighting */}
            <linearGradient id="roofGradDay" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9B8A2" />
              <stop offset="100%" stopColor="#AD9B85" />
            </linearGradient>

            <linearGradient id="roofGradNight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1E1C18" />
              <stop offset="100%" stopColor="#12110F" />
            </linearGradient>

            {/* Room Warm Lighting Glow for Wander Mode */}
            <radialGradient id="lampGlowWarm" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFDE82" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#E59934" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#C26A18" stopOpacity="0" />
            </radialGradient>

            {/* Cinema Blue Glow */}
            <radialGradient id="cinemaGlow" cx="60%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#64B5F6" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#1976D2" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0D47A1" stopOpacity="0" />
            </radialGradient>

            {/* Pulsing Hotspot Animation */}
            <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ─────────────────────────────────────────────────────────
              HOUSE STRUCTURE & ROOF OUTLINE
              ───────────────────────────────────────────────────────── */}
          
          {/* Main House Exterior Wall Cutaway */}
          <path
            d="M 120 220 L 320 70 L 680 70 L 880 220 L 880 580 L 120 580 Z"
            fill={isNight ? "#141310" : "#F5F0E5"}
            stroke={isNight ? "#2E2A23" : "#2F2E2A"}
            strokeWidth="3"
          />

          {/* Roof Gables & Chimneys */}
          <polygon
            points="100,230 320,60 680,60 900,230 870,240 670,80 330,80 130,240"
            fill={isNight ? "url(#roofGradNight)" : "url(#roofGradDay)"}
            stroke={isNight ? "#383329" : "#1A1918"}
            strokeWidth="2"
          />
          {/* Left Chimney */}
          <rect
            x="240"
            y="30"
            width="35"
            height="60"
            fill={isNight ? "#1C1A16" : "#B8A995"}
            stroke={isNight ? "#2E2A23" : "#1A1918"}
            strokeWidth="2"
          />
          {/* Right Chimney */}
          <rect
            x="720"
            y="25"
            width="40"
            height="70"
            fill={isNight ? "#1C1A16" : "#B8A995"}
            stroke={isNight ? "#2E2A23" : "#1A1918"}
            strokeWidth="2"
          />

          {/* ─────────────────────────────────────────────────────────
              ROOM 06: THE ATTIC (Top Loft)
              ───────────────────────────────────────────────────────── */}
          <g
            id="room-attic-svg"
            className="cursor-pointer transition-opacity"
            onClick={() => onSelectRoom("attic")}
            onMouseEnter={() => setHoveredRoom("attic")}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Room Enclosure */}
            <polygon
              points="335,85 665,85 760,200 240,200"
              fill={
                isNight
                  ? hoveredRoom === "attic" || activeRoomId === "attic"
                    ? "#2E2416"
                    : "#1C1710"
                  : hoveredRoom === "attic" || activeRoomId === "attic"
                  ? "#F7F1E1"
                  : "#EFE9DB"
              }
              stroke={isNight ? "#3D3425" : "#1A1918"}
              strokeWidth={hoveredRoom === "attic" || activeRoomId === "attic" ? "3" : "1.5"}
            />
            
            {/* Night Warm Light Aura */}
            {isNight && (
              <circle cx="500" cy="140" r="100" fill="url(#lampGlowWarm)" opacity="0.6" />
            )}

            {/* Wooden Rafter Beams */}
            <line x1="335" y1="85" x2="390" y2="200" stroke={isNight ? "#2D261C" : "#C7B9A4"} strokeWidth="3" />
            <line x1="665" y1="85" x2="610" y2="200" stroke={isNight ? "#2D261C" : "#C7B9A4"} strokeWidth="3" />
            <line x1="500" y1="85" x2="500" y2="200" stroke={isNight ? "#2D261C" : "#C7B9A4"} strokeWidth="3" />

            {/* Attic Furniture / Skylight */}
            <rect
              x="475"
              y="100"
              width="50"
              height="35"
              fill={isNight ? "#FFDE82" : "#FFFEEF"}
              stroke={isNight ? "#C2933C" : "#1A1918"}
              strokeWidth="2"
              opacity={isNight ? "0.9" : "1"}
            />
            {/* Sketch table */}
            <rect x="430" y="165" width="140" height="10" fill={isNight ? "#3A2E1D" : "#9B7D58"} />
            <line x1="445" y1="175" x2="445" y2="200" stroke={isNight ? "#3A2E1D" : "#9B7D58"} strokeWidth="3" />
            <line x1="555" y1="175" x2="555" y2="200" stroke={isNight ? "#3A2E1D" : "#9B7D58"} strokeWidth="3" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              ROOM 03: THE LIBRARY (Upper Left)
              ───────────────────────────────────────────────────────── */}
          <g
            id="room-library-svg"
            className="cursor-pointer transition-opacity"
            onClick={() => onSelectRoom("library")}
            onMouseEnter={() => setHoveredRoom("library")}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Floor Boundary */}
            <rect
              x="135"
              y="200"
              width="340"
              height="180"
              fill={
                isNight
                  ? isRoomActive("library")
                    ? "#261E14"
                    : "#17130D"
                  : isRoomActive("library")
                  ? "#FBF6EC"
                  : "#F3EDE1"
              }
              stroke={isNight ? "#3A3022" : "#1A1918"}
              strokeWidth={isRoomActive("library") ? "3" : "2"}
            />

            {/* Night Warm Lamp Glow */}
            {isNight && (
              <circle cx="280" cy="270" r="110" fill="url(#lampGlowWarm)" opacity="0.75" />
            )}

            {/* Bookshelves lining the wall */}
            <g opacity={isNight ? "0.7" : "0.9"}>
              <rect x="150" y="215" width="220" height="15" fill={isNight ? "#2E2416" : "#A68966"} />
              <rect x="150" y="250" width="220" height="15" fill={isNight ? "#2E2416" : "#A68966"} />
              <rect x="150" y="285" width="220" height="15" fill={isNight ? "#2E2416" : "#A68966"} />
              {/* Colorful books on shelf */}
              <rect x="160" y="230" width="10" height="20" fill="#8B4513" />
              <rect x="172" y="225" width="14" height="25" fill="#B34B38" />
              <rect x="188" y="232" width="12" height="18" fill="#4A6B56" />
              <rect x="202" y="228" width="16" height="22" fill="#C2A649" />
              <rect x="220" y="230" width="10" height="20" fill="#2E4A62" />
            </g>

            {/* Reading Desk & Chair */}
            <rect x="260" y="325" width="120" height="10" fill={isNight ? "#3D2E1A" : "#8A6D4B"} />
            <line x1="275" y1="335" x2="275" y2="380" stroke={isNight ? "#3D2E1A" : "#8A6D4B"} strokeWidth="3" />
            <line x1="365" y1="335" x2="365" y2="380" stroke={isNight ? "#3D2E1A" : "#8A6D4B"} strokeWidth="3" />
            {/* Open Book on Desk */}
            <polygon points="300,323 318,318 336,323 336,325 318,321 300,325" fill="#FFF8EE" stroke="#1A1918" strokeWidth="1" />
            {/* Table Lamp */}
            <path d="M 270 325 L 275 305 L 290 305 L 295 325 Z" fill={isNight ? "#FFDD78" : "#E2C876"} stroke="#1A1918" strokeWidth="1" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              ROOM 01: THE STUDIO (Upper Right)
              ───────────────────────────────────────────────────────── */}
          <g
            id="room-studio-svg"
            className="cursor-pointer transition-opacity"
            onClick={() => onSelectRoom("studio")}
            onMouseEnter={() => setHoveredRoom("studio")}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Floor Boundary */}
            <rect
              x="525"
              y="200"
              width="340"
              height="180"
              fill={
                isNight
                  ? isRoomActive("studio")
                    ? "#23201A"
                    : "#15130F"
                  : isRoomActive("studio")
                  ? "#FBF7ED"
                  : "#F4EEE2"
              }
              stroke={isNight ? "#383024" : "#1A1918"}
              strokeWidth={isRoomActive("studio") ? "3" : "2"}
            />

            {/* Night Warm Ambient Glow */}
            {isNight && (
              <circle cx="680" cy="270" r="110" fill="url(#lampGlowWarm)" opacity="0.75" />
            )}

            {/* Large Window on right wall */}
            <rect
              x="825"
              y="225"
              width="30"
              height="80"
              fill={isNight ? "#1C242B" : "#D4E6ED"}
              stroke={isNight ? "#383024" : "#1A1918"}
              strokeWidth="2"
            />
            {/* Window Grid Lines */}
            <line x1="840" y1="225" x2="840" y2="305" stroke={isNight ? "#383024" : "#1A1918"} strokeWidth="1.5" />
            <line x1="825" y1="265" x2="855" y2="265" stroke={isNight ? "#383024" : "#1A1918"} strokeWidth="1.5" />

            {/* Studio Modern Workstation / iMac */}
            <rect x="620" y="320" width="150" height="12" fill={isNight ? "#3A2E1E" : "#8F6F4C"} />
            <line x1="640" y1="332" x2="640" y2="380" stroke={isNight ? "#3A2E1E" : "#8F6F4C"} strokeWidth="3" />
            <line x1="750" y1="332" x2="750" y2="380" stroke={isNight ? "#3A2E1E" : "#8F6F4C"} strokeWidth="3" />
            
            {/* Computer Display (Glows cool white/cyan at night) */}
            <rect
              x="660"
              y="270"
              width="65"
              height="42"
              rx="2"
              fill={isNight ? "#E3F2FD" : "#FFFFFF"}
              stroke="#1A1918"
              strokeWidth="2"
            />
            <rect x="688" y="312" width="10" height="8" fill="#888" />
            <rect x="678" y="319" width="30" height="2" fill="#666" />
            
            {/* Wireframe lines on screen */}
            <line x1="666" y1="278" x2="695" y2="278" stroke="#0288D1" strokeWidth="2" />
            <rect x="666" y="284" width="22" height="16" fill="#B3E5FC" />
            <rect x="694" y="284" width="24" height="16" fill="#E1F5FE" />

            {/* Pinned Component Boards on Back Wall */}
            <rect x="550" y="225" width="55" height="40" fill={isNight ? "#2A251C" : "#E2DAC8"} stroke="#1A1918" strokeWidth="1" />
            <line x1="556" y1="235" x2="595" y2="235" stroke="#1A1918" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="556" y1="245" x2="590" y2="245" stroke="#1A1918" strokeWidth="1" strokeDasharray="2 2" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              CENTRAL STAIRCASE & CORRIDORS
              ───────────────────────────────────────────────────────── */}
          <g id="stairs-corridor">
            {/* Stairwell Column */}
            <rect
              x="475"
              y="200"
              width="50"
              height="380"
              fill={isNight ? "#12100E" : "#E6DFD1"}
              stroke={isNight ? "#2E2A23" : "#1A1918"}
              strokeWidth="2"
            />
            {/* Stair Treads */}
            {[230, 260, 290, 320, 350, 410, 440, 470, 500, 530].map((y) => (
              <line
                key={y}
                x1="475"
                y1={y}
                x2="525"
                y2={y}
                stroke={isNight ? "#2A241B" : "#B8A995"}
                strokeWidth="2"
              />
            ))}
            {/* Handrail */}
            <line x1="490" y1="200" x2="490" y2="580" stroke={isNight ? "#3D3425" : "#8A7456"} strokeWidth="2" />

            {/* Front Entrance Door (Ground Level Center) */}
            <path
              d="M 480 500 Q 500 485 520 500 L 520 580 L 480 580 Z"
              fill={isNight ? "#302619" : "#6E472A"}
              stroke="#1A1918"
              strokeWidth="2"
            />
            <circle cx="512" cy="545" r="2.5" fill="#E5C158" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              ROOM 02: THE WORKROOM (Middle/Lower Left)
              ───────────────────────────────────────────────────────── */}
          <g
            id="room-workroom-svg"
            className="cursor-pointer transition-opacity"
            onClick={() => onSelectRoom("workroom")}
            onMouseEnter={() => setHoveredRoom("workroom")}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Floor Boundary */}
            <rect
              x="135"
              y="380"
              width="180"
              height="200"
              fill={
                isNight
                  ? isRoomActive("workroom")
                    ? "#241F17"
                    : "#15120D"
                  : isRoomActive("workroom")
                  ? "#F7F3E7"
                  : "#EFE8DC"
              }
              stroke={isNight ? "#382F22" : "#1A1918"}
              strokeWidth={isRoomActive("workroom") ? "3" : "2"}
            />

            {/* Night Warm Lamp Glow */}
            {isNight && (
              <circle cx="215" cy="450" r="90" fill="url(#lampGlowWarm)" opacity="0.8" />
            )}

            {/* Wall-Mounted Regional Map */}
            <rect
              x="150"
              y="405"
              width="80"
              height="55"
              fill={isNight ? "#2E3028" : "#DDE5D6"}
              stroke="#1A1918"
              strokeWidth="1.5"
            />
            {/* Contour lines on map */}
            <path d="M 155 425 Q 170 415 190 425 T 225 420" fill="none" stroke="#688F6D" strokeWidth="1.5" />
            <path d="M 155 440 Q 185 435 205 445 T 225 438" fill="none" stroke="#688F6D" strokeWidth="1.5" />

            {/* Fieldwork Desk with Notebook & Cassette Recorder */}
            <rect x="145" y="495" width="105" height="12" fill={isNight ? "#382B1B" : "#8C6A48"} />
            <line x1="160" y1="507" x2="160" y2="580" stroke={isNight ? "#382B1B" : "#8C6A48"} strokeWidth="3" />
            <line x1="235" y1="507" x2="235" y2="580" stroke={isNight ? "#382B1B" : "#8C6A48"} strokeWidth="3" />

            {/* Field Notebook on desk */}
            <rect x="180" y="488" width="22" height="15" rx="1" fill="#FFFBEA" stroke="#1A1918" strokeWidth="1" />
            <line x1="184" y1="492" x2="198" y2="492" stroke="#1A1918" strokeWidth="1" />
            <line x1="184" y1="496" x2="196" y2="496" stroke="#1A1918" strokeWidth="1" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              ROOM 05: THE COURTYARD (Ground Floor Left)
              ───────────────────────────────────────────────────────── */}
          <g
            id="room-courtyard-svg"
            className="cursor-pointer transition-opacity"
            onClick={() => onSelectRoom("courtyard")}
            onMouseEnter={() => setHoveredRoom("courtyard")}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Ground Patio / Glass Atrium */}
            <rect
              x="315"
              y="380"
              width="160"
              height="200"
              fill={
                isNight
                  ? isRoomActive("courtyard")
                    ? "#1E221C"
                    : "#111410"
                  : isRoomActive("courtyard")
                  ? "#F3F5EB"
                  : "#E9ECE1"
              }
              stroke={isNight ? "#2D352B" : "#1A1918"}
              strokeWidth={isRoomActive("courtyard") ? "3" : "2"}
            />

            {/* Night Warm Garden Lantern */}
            {isNight && (
              <circle cx="395" cy="450" r="90" fill="url(#lampGlowWarm)" opacity="0.65" />
            )}

            {/* Garden Greenery & Plants */}
            <path
              d="M 330 550 Q 345 500 365 520 Q 380 480 395 530 Q 420 490 440 550 Z"
              fill={isNight ? "#1C3322" : "#567A5F"}
              stroke="#1A1918"
              strokeWidth="1.5"
            />
            {/* Potted Planter */}
            <polygon points="370,550 410,550 402,580 378,580" fill="#B34B38" stroke="#1A1918" strokeWidth="1.5" />

            {/* Outdoor Stone Table */}
            <ellipse cx="360" cy="540" rx="30" ry="10" fill={isNight ? "#2B2822" : "#D4CCC0"} stroke="#1A1918" strokeWidth="1.5" />
            <line x1="360" y1="550" x2="360" y2="580" stroke="#1A1918" strokeWidth="3" />

            {/* Exterior Lamp */}
            <circle cx="430" cy="420" r="6" fill={isNight ? "#FFE896" : "#E2C876"} stroke="#1A1918" strokeWidth="1.5" />
            <line x1="430" y1="410" x2="430" y2="420" stroke="#1A1918" strokeWidth="2" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              ROOM 04: THE CINEMA (Ground Floor Right)
              ───────────────────────────────────────────────────────── */}
          <g
            id="room-cinema-svg"
            className="cursor-pointer transition-opacity"
            onClick={() => onSelectRoom("cinema")}
            onMouseEnter={() => setHoveredRoom("cinema")}
            onMouseLeave={() => setHoveredRoom(null)}
          >
            {/* Floor Boundary (Darker acoustic walls) */}
            <rect
              x="525"
              y="380"
              width="340"
              height="200"
              fill={
                isNight
                  ? isRoomActive("cinema")
                    ? "#181E29"
                    : "#0C111A"
                  : isRoomActive("cinema")
                  ? "#E6EDF2"
                  : "#D7E1E8"
              }
              stroke={isNight ? "#27384D" : "#1A1918"}
              strokeWidth={isRoomActive("cinema") ? "3" : "2"}
            />

            {/* Atmospheric Blue Whale Projection Glow */}
            <circle cx="700" cy="460" r="130" fill="url(#cinemaGlow)" opacity={isNight ? "0.95" : "0.7"} />

            {/* Large Projection Screen with Whale */}
            <rect
              x="620"
              y="405"
              width="170"
              height="100"
              fill={isNight ? "#09172B" : "#1E3A5F"}
              stroke="#1A1918"
              strokeWidth="2.5"
            />
            {/* Projected Whale Silhouette */}
            <path
              d="M 640 455 Q 670 435 710 445 Q 755 450 770 435 Q 765 460 740 465 Q 695 475 660 465 Z"
              fill="#90CAF9"
              opacity="0.9"
            />
            {/* Whale tail */}
            <polygon points="768,435 785,425 780,445" fill="#90CAF9" opacity="0.9" />

            {/* Projection Beam Cone from projector on right */}
            <polygon
              points="840,430 790,405 790,505"
              fill="#64B5F6"
              opacity={isNight ? "0.2" : "0.1"}
            />
            {/* Projector on Stand */}
            <rect x="830" y="420" width="20" height="15" fill="#333" stroke="#1A1918" strokeWidth="1" />
            <line x1="840" y1="435" x2="840" y2="580" stroke="#1A1918" strokeWidth="2.5" />

            {/* Cinema Viewing Armchair */}
            <rect x="560" y="500" width="35" height="30" rx="3" fill={isNight ? "#422B1E" : "#8D5B3A"} stroke="#1A1918" strokeWidth="1.5" />
            <rect x="555" y="490" width="10" height="40" rx="2" fill={isNight ? "#331E12" : "#6E4226"} stroke="#1A1918" strokeWidth="1" />
            <rect x="590" y="490" width="10" height="40" rx="2" fill={isNight ? "#331E12" : "#6E4226"} stroke="#1A1918" strokeWidth="1" />
          </g>

          {/* ─────────────────────────────────────────────────────────
              WANDER MODE: INTERACTIVE GLOWING BEACON HOTSPOTS
              ───────────────────────────────────────────────────────── */}
          {isNight && (
            <g id="wander-hotspots">
              {/* Studio Laptop Hotspot */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("obj-laptop");
                }}
                onMouseEnter={() => setHoveredHotspot("obj-laptop")}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <circle cx="692" cy="292" r="14" fill="#FFDE82" opacity="0.25" className="animate-ping" />
                <circle cx="692" cy="292" r="7" fill="#FFF2B2" stroke="#FFDE82" strokeWidth="2" filter="url(#glowEffect)" />
                <circle cx="692" cy="292" r="2.5" fill={isObjCollected("obj-laptop") ? "#81C784" : "#1A1918"} />
              </g>

              {/* Workroom Field Map Hotspot */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("obj-field-notebook");
                }}
                onMouseEnter={() => setHoveredHotspot("obj-field-notebook")}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <circle cx="190" cy="495" r="14" fill="#FFDE82" opacity="0.25" className="animate-ping" />
                <circle cx="190" cy="495" r="7" fill="#FFF2B2" stroke="#FFDE82" strokeWidth="2" filter="url(#glowEffect)" />
                <circle cx="190" cy="495" r="2.5" fill={isObjCollected("obj-field-notebook") ? "#81C784" : "#1A1918"} />
              </g>

              {/* Library Book Hotspot */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("obj-illustrated-folio");
                }}
                onMouseEnter={() => setHoveredHotspot("obj-illustrated-folio")}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <circle cx="318" cy="320" r="14" fill="#FFDE82" opacity="0.25" className="animate-ping" />
                <circle cx="318" cy="320" r="7" fill="#FFF2B2" stroke="#FFDE82" strokeWidth="2" filter="url(#glowEffect)" />
                <circle cx="318" cy="320" r="2.5" fill={isObjCollected("obj-illustrated-folio") ? "#81C784" : "#1A1918"} />
              </g>

              {/* Cinema Projector Hotspot */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("obj-film-reel");
                }}
                onMouseEnter={() => setHoveredHotspot("obj-film-reel")}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <circle cx="705" cy="450" r="16" fill="#90CAF9" opacity="0.3" className="animate-ping" />
                <circle cx="705" cy="450" r="8" fill="#E3F2FD" stroke="#64B5F6" strokeWidth="2" filter="url(#glowEffect)" />
                <circle cx="705" cy="450" r="2.5" fill={isObjCollected("obj-film-reel") ? "#81C784" : "#0D47A1"} />
              </g>

              {/* Courtyard Camera Hotspot */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("obj-camera");
                }}
                onMouseEnter={() => setHoveredHotspot("obj-camera")}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <circle cx="360" cy="535" r="14" fill="#FFDE82" opacity="0.25" className="animate-ping" />
                <circle cx="360" cy="535" r="7" fill="#FFF2B2" stroke="#FFDE82" strokeWidth="2" filter="url(#glowEffect)" />
                <circle cx="360" cy="535" r="2.5" fill={isObjCollected("obj-camera") ? "#81C784" : "#1A1918"} />
              </g>

              {/* Attic Origami Crane Hotspot */}
              <g
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectObject("obj-origami-crane");
                }}
                onMouseEnter={() => setHoveredHotspot("obj-origami-crane")}
                onMouseLeave={() => setHoveredHotspot(null)}
              >
                <circle cx="500" cy="160" r="14" fill="#FFDE82" opacity="0.25" className="animate-ping" />
                <circle cx="500" cy="160" r="7" fill="#FFF2B2" stroke="#FFDE82" strokeWidth="2" filter="url(#glowEffect)" />
                <circle cx="500" cy="160" r="2.5" fill={isObjCollected("obj-origami-crane") ? "#81C784" : "#1A1918"} />
              </g>
            </g>
          )}

          {/* ─────────────────────────────────────────────────────────
              WORK MODE: ARCHITECTURAL LEADER CALLOUT LINES
              Directly reproducing the leader callouts from Panel 1
              ───────────────────────────────────────────────────────── */}
          {!isNight && (
            <g id="work-leader-lines" pointerEvents="none">
              {/* Library Leader (Top Left) */}
              <circle cx="280" cy="270" r="3.5" fill="#1A1918" />
              <polyline points="280,270 210,210 100,210" fill="none" stroke="#1A1918" strokeWidth="1.5" />

              {/* Workroom Leader (Mid Left) */}
              <circle cx="215" cy="450" r="3.5" fill="#1A1918" />
              <polyline points="215,450 140,360 80,360" fill="none" stroke="#1A1918" strokeWidth="1.5" />

              {/* Courtyard Leader (Bottom Left) */}
              <circle cx="360" cy="520" r="3.5" fill="#1A1918" />
              <polyline points="360,520 280,480 80,480" fill="none" stroke="#1A1918" strokeWidth="1.5" />

              {/* Attic Leader (Top Right) */}
              <circle cx="560" cy="150" r="3.5" fill="#1A1918" />
              <polyline points="560,150 720,130 920,130" fill="none" stroke="#1A1918" strokeWidth="1.5" />

              {/* Studio Leader (Mid Right) */}
              <circle cx="700" cy="300" r="3.5" fill="#1A1918" />
              <polyline points="700,300 780,270 920,270" fill="none" stroke="#1A1918" strokeWidth="1.5" />

              {/* Cinema Leader (Bottom Right) */}
              <circle cx="705" cy="450" r="3.5" fill="#1A1918" />
              <polyline points="705,450 820,430 920,430" fill="none" stroke="#1A1918" strokeWidth="1.5" />
            </g>
          )}

        </svg>

        {/* ─────────────────────────────────────────────────────────
            HTML OVERLAY CALLOUT LABELS (FOR WORK MODE)
            Positioned with percentage coordinates matching Panel 1
            ───────────────────────────────────────────────────────── */}
        {!isNight && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Library Label (Top Left) */}
            <div
              className="absolute left-[3%] top-[12%] sm:top-[15%] text-left pointer-events-auto cursor-pointer group"
              onClick={() => onSelectRoom("library")}
            >
              <h4 className="font-serif text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#1A1918] group-hover:text-[#C04A38] transition-colors">
                The Library
              </h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1918]/60 leading-tight">
                Illustration<br />Visual Narratives<br />Writing
              </p>
            </div>

            {/* Workroom Label (Mid Left) */}
            <div
              className="absolute left-[2%] top-[40%] sm:top-[43%] text-left pointer-events-auto cursor-pointer group"
              onClick={() => onSelectRoom("workroom")}
            >
              <h4 className="font-serif text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#1A1918] group-hover:text-[#C04A38] transition-colors">
                The Workroom
              </h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1918]/60 leading-tight">
                Research<br />Ethnography<br />Service Design
              </p>
            </div>

            {/* Courtyard Label (Bottom Left) */}
            <div
              className="absolute left-[2%] bottom-[16%] sm:bottom-[18%] text-left pointer-events-auto cursor-pointer group"
              onClick={() => onSelectRoom("courtyard")}
            >
              <h4 className="font-serif text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#1A1918] group-hover:text-[#C04A38] transition-colors">
                The Courtyard
              </h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1918]/60 leading-tight">
                Observations<br />Photography<br />Fragments
              </p>
            </div>

            {/* Attic Label (Top Right) */}
            <div
              className="absolute right-[3%] top-[8%] sm:top-[11%] text-right pointer-events-auto cursor-pointer group"
              onClick={() => onSelectRoom("attic")}
            >
              <h4 className="font-serif text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#1A1918] group-hover:text-[#C04A38] transition-colors">
                The Attic
              </h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1918]/60 leading-tight">
                Experiments<br />Unfinished Ideas
              </p>
            </div>

            {/* Studio Label (Mid Right) */}
            <div
              className="absolute right-[3%] top-[33%] sm:top-[35%] text-right pointer-events-auto cursor-pointer group"
              onClick={() => onSelectRoom("studio")}
            >
              <h4 className="font-serif text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#1A1918] group-hover:text-[#C04A38] transition-colors">
                The Studio
              </h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1918]/60 leading-tight">
                UX/UI<br />Product Design<br />Systems
              </p>
            </div>

            {/* Cinema Label (Bottom Right) */}
            <div
              className="absolute right-[3%] bottom-[18%] sm:bottom-[22%] text-right pointer-events-auto cursor-pointer group"
              onClick={() => onSelectRoom("cinema")}
            >
              <h4 className="font-serif text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#1A1918] group-hover:text-[#C04A38] transition-colors">
                The Cinema
              </h4>
              <p className="font-mono text-[9px] sm:text-[10px] text-[#1A1918]/60 leading-tight">
                Film<br />Speculative Design<br />Moving Image
              </p>
            </div>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────
            HTML OVERLAY SKETCHY LABELS (FOR WANDER MODE)
            Matching Panel 2 cursive / handwritten styling
            ───────────────────────────────────────────────────────── */}
        {isNight && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Attic Annotation */}
            <div className="absolute left-[45%] top-[5%] text-center text-[#FFDE82]/80 font-serif italic text-xs sm:text-sm">
              attic<br /><span className="text-[10px] font-sans opacity-70">experiments</span>
            </div>

            {/* Library Annotation */}
            <div className="absolute right-[70%] top-[22%] text-right text-[#FFDE82]/80 font-serif italic text-xs sm:text-sm">
              library<br /><span className="text-[10px] font-sans opacity-70">illustration, writing</span>
            </div>

            {/* Workroom Annotation */}
            <div className="absolute left-[3%] top-[45%] text-left text-[#FFDE82]/80 font-serif italic text-xs sm:text-sm">
              workroom<br /><span className="text-[10px] font-sans opacity-70">research, fieldwork</span>
            </div>

            {/* Studio Annotation */}
            <div className="absolute right-[3%] top-[33%] text-right text-[#FFDE82]/80 font-serif italic text-xs sm:text-sm">
              studio<br /><span className="text-[10px] font-sans opacity-70">ux/ui, product design</span>
            </div>

            {/* Cinema Annotation */}
            <div className="absolute right-[3%] bottom-[20%] text-right text-[#90CAF9]/80 font-serif italic text-xs sm:text-sm">
              cinema<br /><span className="text-[10px] font-sans opacity-70">film, speculative</span>
            </div>

            {/* Courtyard Annotation */}
            <div className="absolute left-[3%] bottom-[15%] text-left text-[#FFDE82]/80 font-serif italic text-xs sm:text-sm">
              courtyard<br /><span className="text-[10px] font-sans opacity-70">observations, fragments</span>
            </div>

            {/* Hover Tooltip when hovering over a hotspot */}
            {hoveredHotspot && COLLECTIBLE_OBJECTS[hoveredHotspot] && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1C1A17]/95 border border-[#FFDE82]/40 text-[#F4F1EA] px-4 py-2 rounded-lg shadow-2xl backdrop-blur-md pointer-events-none transition-all z-20 text-center">
                <span className="font-serif italic text-sm text-[#FFDE82] block">
                  {COLLECTIBLE_OBJECTS[hoveredHotspot].name}
                </span>
                <span className="font-mono text-[10px] text-white/60 block">
                  {COLLECTIBLE_OBJECTS[hoveredHotspot].connectedProjectTitle} &middot; Click to inspect
                </span>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Mode Guidance Subtitle */}
      <div className="flex justify-between items-center px-2 mt-2 font-mono text-[11px] text-[#1A1918]/50">
        <span className="hidden sm:inline">
          {isNight
            ? "✦ Click glowing beacons to explore objects and collect fragments"
            : "Click any room in the cutaway to enter and inspect its work"}
        </span>
        <span className="ml-auto font-mono text-[10px] tracking-wider uppercase">
          {isNight ? "WANDER MODE: NIGHT ATELIER" : "RECRUITER MODE: ARCHITECTURAL CUTAWAY"}
        </span>
      </div>

    </div>
  );
}
